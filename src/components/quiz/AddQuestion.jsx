import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap";
import { utf8ToBase64String } from "../../utils/conversions";

const AddQuestion = ({ createQuestion }) => {
  const [questionTitle, SetQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [answer, setAnswer] = useState("");

  const isFormFilled = useCallback(() => {
    return questionTitle && option1 && option2 && option3 && option4 && answer;
  }, [questionTitle, option1, option2, option3, option4, answer]);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button onClick={handleShow} variant="dark" style={{ margin: "3px" }}>
        Add New Question
      </Button>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Question</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <FloatingLabel
              controlId="inputName"
              label="Question"
              className="mb-3"
            >
              <Form.Control
                type="text"
                onChange={(e) => {
                  SetQuestion(e.target.value);
                }}
                placeholder="Enter Question"
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputUrl"
              label="Option1"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Enter first option"
                onChange={(e) => {
                  setOption1(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputUrl"
              label="Option2"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Enter second option"
                onChange={(e) => {
                  setOption2(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputUrl"
              label="Option3"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Enter third option"
                onChange={(e) => {
                  setOption3(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputUrl"
              label="Option4"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Enter fourth option"
                onChange={(e) => {
                  setOption4(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel controlId="inputUrl" label="Answer" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter answer"
                onChange={(e) => {
                  setAnswer(utf8ToBase64String(e.target.value));
                }}
              />
            </FloatingLabel>
          </Modal.Body>
        </Form>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              createQuestion({
                questionTitle,
                option1,
                option2,
                option3,
                option4,
                answer,
              });
              handleClose();
            }}
          >
            Add Question
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

AddQuestion.propTypes = {
  createQuestion: PropTypes.func.isRequired,
};

export default AddQuestion;
