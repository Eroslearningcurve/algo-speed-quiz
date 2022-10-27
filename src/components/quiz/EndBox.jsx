import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";

const EndBox = ({ endQuiz, totalTime, score = 0 }) => {
  const calculatePercent = () => {
    let result = (score / totalTime) * 100;
    endQuiz(Math.round(result));
  };
  return (
    <>
      <div className="box" id="end-quiz-box">
        <h4>Quiz session has ended</h4>
        <Button
          variant="primary"
          className="disp-button"
          onClick={() => calculatePercent()}
        >
          End Quiz
        </Button>
      </div>
    </>
  );
};

EndBox.propTypes = {
  endQuiz: PropTypes.func.isRequired,
  totalTime: PropTypes.number,
  score: PropTypes.number,
};

export default EndBox;
