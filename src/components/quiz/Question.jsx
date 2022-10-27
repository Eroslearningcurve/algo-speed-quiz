import React, { useState } from "react";
import { Button, ToggleButton } from "react-bootstrap";
import { utf8ToBase64String } from "../../utils/conversions";
import PropTypes from "prop-types";

const Question = ({ question, nextQuestion, payPenalty }) => {
  const [playerAnswer, setPlayerAnswer] = useState("");
  const [posn, setIndex] = useState(0);
  const [variants, updateVariant] = useState(
    new Array(4).fill("outline-success")
  );

  const handleChange = (e, index) => {
    setPlayerAnswer(e.currentTarget.value);
    setIndex(index);
  };

  const checkAnswer = () => {
    if (utf8ToBase64String(playerAnswer) !== question.answer) {
      const update = variants.map((variant, index) =>
        index === posn ? "outline-danger" : variant
      );
      updateVariant(update);
      payPenalty();
    }

    setTimeout(() => {
      updateVariant(new Array(4).fill("outline-success"));
      nextQuestion();
    }, 350);
  };

  return (
    <>
      <h4 id="question" className="question-title">
        {question.question}
      </h4>
      <div className="borderless">
        {question.options.map((option, index) => (
          <ToggleButton
            key={index}
            id={`radio-${index}`}
            type="radio"
            variant={variants[index]}
            name="radio"
            value={option}
            checked={playerAnswer === option}
            className={"option"}
            onChange={(e) => handleChange(e, index)}
          >
            {option}
          </ToggleButton>
        ))}
      </div>

      <Button
        variant="dark"
        className="submitBtn"
        disabled={!playerAnswer}
        onClick={() => checkAnswer()}
      >
        submit
      </Button>
    </>
  );
};

Question.propTypes = {
  question: PropTypes.instanceOf(Object),
  nextQuestion: PropTypes.func.isRequired,
  payPenalty: PropTypes.func,
};

export default Question;
