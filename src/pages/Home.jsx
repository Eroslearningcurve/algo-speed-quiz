import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NavBarHome from "../components/quiz/NavBarHome";
import Loader from "../components/Loader";
import {
  getQuizzesAction,
  getPlayerHistoryAction,
  createQuizAction,
  deleteQuizAction,
} from "../utils/speedquiz";

const Home = ({ address, name, balance, fetchBalance, disconnect }) => {
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [quizId, setQuizId] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [playerHistory, setPlayerHistory] = useState([]);
  const navigate = useNavigate();

  const findQuiz = () =>
    navigate({
      pathname: "/quiz",
      search: `?quizId=${quizId}`,
    });

  const getQuizzes = useCallback(async () => {
    setLoading(true);
    toast.info("Getting Your Info");
    getQuizzesAction(address)
      .then((quizzes) => {
        if (quizzes) {
          setQuizzes(quizzes);
        }
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      })
      .finally((_) => {
        setLoading(false);
      });
  }, [address]);

  const getPlayerhistory = useCallback(async () => {
    setLoading1(true);
    await getPlayerHistoryAction(address)
      .then((history) => {
        if (history) {
          setPlayerHistory(history);
        }
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      })
      .finally((_) => {
        setLoading1(false);
      });
  }, [address]);

  const createQuiz = async (data) => {
    toast.info("Creating New Quiz");
    setLoading(true);
    createQuizAction(address, data)
      .then(() => {
        toast.dismiss();
        toast.success("Quiz added successfully.");
        getQuizzes();
        fetchBalance(address);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        toast.dismiss();
        toast.error("Failed to create quiz.");
      });
  };

  const deleteQuiz = async (quiz) => {
    toast.info("Deleting Quiz");
    setLoading(true);
    deleteQuizAction(address, quiz.appId)
      .then(() => {
        toast.dismiss();
        toast.success("Quiz deleted successfully");
        getQuizzes();
        fetchBalance(address);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        toast.dismiss();
        toast.success("Failed to delete quiz.");
      });
  };

  useEffect(() => {
    getPlayerhistory();
    getQuizzes();
  }, [getPlayerhistory, getQuizzes]);

  if (loading || loading1) return <Loader />;

  return (
    <>
      <NavBarHome
        address={address}
        name={name}
        balance={balance}
        quizzes={quizzes}
        playerHistory={playerHistory}
        createQuiz={createQuiz}
        deleteQuiz={deleteQuiz}
        disconnect={disconnect}
      />
      <section className="home-section">
        <div>
          <h1>Enter Quiz ID</h1>
          <Form>
            <Form.Control
              type="text"
              className="mb-2 input-quiz-value"
              placeholder="E.g. Quiz-118504956, Quiz-115xx2, Quiz-19xxx66"
              onChange={(e) => {
                setQuizId(e.target.value);
              }}
            />
            <Button
              id="find-quiz"
              variant="dark"
              className="find-quiz mb-4"
              disabled={!quizId}
              onClick={() => findQuiz()}
              style={{ marginTop: "10px" }}
            >
              Find Quiz
            </Button>
          </Form>
        </div>
      </section>
    </>
  );
};

Home.propTypes = {
  address: PropTypes.string,
  name: PropTypes.string,
  balance: PropTypes.number,
  disconnect: PropTypes.func.isRequired,
  fetchBalance: PropTypes.func.isRequired,
};

export default Home;
