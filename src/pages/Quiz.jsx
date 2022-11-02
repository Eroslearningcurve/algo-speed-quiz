import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "../css/quiz.css";
import NavBarQuiz from "../components/quiz/NavBarQuiz";
import RulesBox from "../components/quiz/RulesBox";
import InfoBox from "../components/quiz/InfoBox";
import QuestionBox from "../components/quiz/QuestionBox";
import EndBox from "../components/quiz/EndBox";
import {
  getQuestionsAction,
  getInfo,
  getQuizApplication,
  createQuestionAction,
  startQuizAction,
  endQuizAction,
  optInAction,
} from "../utils/speedquiz";
import Loader from "../components/Loader";

const Quiz = ({ address, name, balance, fetchBalance, disconnect }) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [quizInfo, setQuizInfo] = useState({});
  const [playerInfo, setPlayerInfo] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  let quizId = searchParams.get("quizId");

  const toResultsPage = (score) =>
    navigate({
      pathname: "/Result",
      search: `?score=${score}`,
    });

  const getQuizInfo = useCallback(async () => {
    setLoading(true);
    toast.info("Getting Quiz Info");
    if (!quizId) return;
    const id = quizId.match(/(\d+)/);
    await getQuizApplication(Number(id[0]))
      .then((quiz) => {
        if (quiz) {
          setQuizInfo(quiz);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [quizId]);

  const getQuestions = useCallback(async () => {
    setLoading(true);
    if (!quizId) return;
    await getQuestionsAction(quizId)
      .then((questions) => {
        if (questions) {
          setQuestions(questions);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally((_) => {
        setLoading(false);
      });
  }, [quizId]);

  const getPlayerInfo = useCallback(
    async (closeLoader = false) => {
      setLoading(true);
      if (!quizId) return;
      const id = quizId.match(/(\d+)/);
      await getInfo(Number(id[0]), address)
        .then((info) => {
          if (info) {
            setPlayerInfo(info);
          }
        })
        .catch((error) => {
          console.log(error);
        });

      if (closeLoader) {
        setLoading(false);
      }
    },
    [quizId, address]
  );

  const optIn = async () => {
    toast.info("Opting In...");
    setLoading(true);
    optInAction(address, quizInfo)
      .then(() => {
        toast.dismiss();
        toast.success("Player OptedIn.");
        getPlayerInfo(true);
        fetchBalance(address);
      })
      .catch((error) => {
        console.log(error);
        toast.dismiss();
        toast.error("Failed to opt in.");
        setLoading(false);
      });
  };

  const createQuestion = async (data) => {
    setLoading(true);
    toast.info("Adding Question");
    createQuestionAction(address, data, quizInfo)
      .then(() => {
        toast.dismiss();
        toast.success("Quiz added successfully.");
        getQuizInfo();
        getQuestions();
        fetchBalance(address);
      })
      .catch((error) => {
        console.log(error);
        toast.dismiss();
        toast.error("Failed to create quiz.");
        setLoading(false);
      });
  };

  const startQuiz = async () => {
    setLoading(true);
    toast.info("Starting Quiz Session");
    startQuizAction(address, quizInfo, playerInfo)
      .then(async () => {
        toast.dismiss();
        toast.success("Quiz started successfully.");
        await getPlayerInfo(true);
        fetchBalance(address);
        setQuizStarted(true);
      })
      .catch((error) => {
        console.log(error);
        toast.dismiss();
        toast.error("Failed to start quiz.");
        setLoading(false);
      });
  };

  const endQuiz = async (score) => {
    setLoading(true);
    toast.info("Ending Quiz Session");
    endQuizAction(address, score, quizInfo)
      .then(() => {
        toast.dismiss();
        toast.success("Quiz ended successfully.");
        fetchBalance(address);
        toResultsPage(score);
        setLoading(false);
        sessionStorage.removeItem("score");
      })
      .catch((error) => {
        console.log(error);
        setQuizStarted(false);
        toast.dismiss();
        toast.error("Failed to end quiz.");
        setLoading(false);
      });
  };

  useEffect(() => {
    let check = true;
    if (check) {
      getQuizInfo();
      getQuestions();
      getPlayerInfo();
    }
    return () => (check = false);
  }, [getQuizInfo, getQuestions, getPlayerInfo]);

  if (loading) return <Loader />;
  return (
    <>
      <NavBarQuiz
        address={address}
        name={name}
        quizInfo={quizInfo}
        balance={balance}
        disconnect={disconnect}
      />
      <section>
        <div className="container-box">
          {playerInfo.playerQuizState && !quizStarted ? (
            <EndBox endQuiz={endQuiz} totalTime={quizInfo.totalTime} />
          ) : questions.length === 0 ? (
            <InfoBox
              address={address}
              quizInfo={quizInfo}
              addQuestion={createQuestion}
            />
          ) : quizStarted ? (
            <QuestionBox
              quizInfo={quizInfo}
              questions={questions}
              endQuiz={endQuiz}
            />
          ) : (
            <RulesBox
              address={address}
              optedIn={playerInfo.optedIn}
              quizInfo={quizInfo}
              addQuestion={createQuestion}
              startQuiz={startQuiz}
              optIn={optIn}
            />
          )}
        </div>
      </section>
    </>
  );
};

Quiz.propTypes = {
  address: PropTypes.string,
  name: PropTypes.string,
  balance: PropTypes.number,
  disconnect: PropTypes.func.isRequired,
  fetchBalance: PropTypes.func.isRequired,
};

export default Quiz;
