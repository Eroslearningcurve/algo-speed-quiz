import React from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import AddQuestion from "./AddQuestion";

const RulesBox = ({
  address,
  optedIn,
  quizInfo,
  addQuestion,
  startQuiz,
  optIn,
}) => {
  const { timePerQuestion, totalTime, appCreator, passPercent } = quizInfo;
  const isCreator = () => appCreator === address;
  const navigate = useNavigate();
  const backHome = () =>
    navigate({
      pathname: "/",
    });
  return (
    <>
      <div className="box" id="rules-box">
        <h3>Rules:</h3>
        <p id="quiz-time"> Max time to solve quiz is {totalTime} seconds</p>
        <p id="question-time">
          {" "}
          Max time to solve one question is {timePerQuestion} seconds
        </p>
        <p id="question-time">
          {" "}
          Player must register before quiz can be taken.
        </p>
        <p id="question-time"> Pass Percent {passPercent}%</p>
        <div className={"d-flex justify-content-evenly borderless"}>
          {optedIn ? (
            <Button
              variant="success"
              className="disp-button"
              onClick={() => startQuiz()}
            >
              Start Quiz
            </Button>
          ) : (
            <Button
              variant="success"
              className="disp-button"
              onClick={() => optIn()}
            >
              Register
            </Button>
          )}
          <Button
            variant="primary"
            className="disp-button"
            onClick={() => backHome()}
          >
            Go Back Home
          </Button>
          {isCreator() && <AddQuestion createQuestion={addQuestion} />}
        </div>
      </div>
    </>
  );
};

RulesBox.propTypes = {
  address: PropTypes.string,
  optedIn: PropTypes.bool,
  quizInfo: PropTypes.instanceOf(Object).isRequired,
  addQuestion: PropTypes.func.isRequired,
  startQuiz: PropTypes.func.isRequired,
  optIn: PropTypes.func.isRequired,
};

export default RulesBox;
