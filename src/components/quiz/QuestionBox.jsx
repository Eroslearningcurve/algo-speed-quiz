import React, { useState } from "react";
import PropTypes from "prop-types";
import Question from "./Question";
import EndBox from "./EndBox";
import { useCountdown } from "../../hooks/useCountDown";

const QuestionBox = ({ quizInfo, questions, endQuiz }) => {
  const [number, setNumber] = useState(0);
  const [done, setDone] = useState(false);

  const { countDown: quizTime, payPenalty } = useCountdown(
    quizInfo.totalTime,
    done
  );

  const { countDown: questionTime, reset } = useCountdown(
    quizInfo.timePerQuestion,
    done
  );

  const nextQuestion = () => {
    setNumber(number + 1);
    if (number === questions.length - 1) {
      setDone(true);
    } else {
      reset();
    }
  };

  if (questionTime < 0 && number < questions.length) {
    nextQuestion();
  }

  if (number === questions.length || quizTime < 0) {
    sessionStorage.setItem("score", quizTime);
    return (
      <EndBox
        endQuiz={endQuiz}
        score={quizTime}
        totalTime={quizInfo.totalTime}
      />
    );
  }

  return (
    <>
      <div className="question-box" id="question-box">
        <div className="time-box borderless">
          <p className="display-time">Time Left for quiz: {quizTime}</p>
          <br />
          <p className="display-time">Time left for question: {questionTime}</p>
        </div>
        <Question
          question={questions[number]}
          nextQuestion={nextQuestion}
          payPenalty={payPenalty}
        />
      </div>
    </>
  );
};

QuestionBox.propTypes = {
  quizInfo: PropTypes.instanceOf(Object).isRequired,
  questions: PropTypes.instanceOf(Array).isRequired,
  endQuiz: PropTypes.func.isRequired,
};

export default QuestionBox;
