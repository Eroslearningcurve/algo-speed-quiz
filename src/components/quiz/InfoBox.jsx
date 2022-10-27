import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";
import AddQuestion from "./AddQuestion";

const InfoBox = ({ address, quizInfo, addQuestion }) => {
  const { appCreator } = quizInfo;
  const isCreator = () => appCreator === address;
  const navigate = useNavigate();
  const backHome = () =>
    navigate({
      pathname: "/",
    });
  return (
    <>
      <div className="box" id="info-box">
        <h4>Sorry this Quiz is not yet available</h4>
        <div className="borderless">
          {isCreator() && <AddQuestion createQuestion={addQuestion} />}
          <Button
            variant="primary"
            className="disp-button"
            onClick={() => backHome()}
          >
            Go Back Home
          </Button>
        </div>
      </div>
    </>
  );
};

InfoBox.propTypes = {
  address: PropTypes.string,
  quizInfo: PropTypes.instanceOf(Object).isRequired,
  addQuestion: PropTypes.func.isRequired,
};

export default InfoBox;
