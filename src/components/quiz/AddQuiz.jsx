import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap";

const AddQuiz = ({ createQuiz }) => {
  const [title, setTitle] = useState("");
  const [timePerQuestion, setTime] = useState(0);
  const [passPercent, setPassPercent] = useState(0);

  const isFormFilled = useCallback(() => {
    return title && timePerQuestion > 0 && passPercent > 0;
  }, [title, timePerQuestion, passPercent]);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <a
        className="btn nav-link m-0"
        style={{ color: "white", padding: "10px" }}
        href="/#"
        onClick={handleShow}
      >
        Create New Quiz
      </a>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New Quiz</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <FloatingLabel
              controlId="inputName"
              label="Quiz title"
              className="mb-3"
            >
              <Form.Control
                type="text"
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                placeholder="Enter Quiz Title"
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputTime"
              label="Enter min percent to pass quiz"
              className="mb-3"
            >
              <Form.Control
                type="number"
                min={1}
                max={100}
                placeholder="Enter Min Score Percent"
                onChange={(e) => {
                  setPassPercent(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputTime"
              min={1}
              label="Time per question in seconds"
              className="mb-3"
            >
              <Form.Control
                type="number"
                placeholder="Enter Time Per Question in seconds"
                onChange={(e) => {
                  setTime(e.target.value);
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
              createQuiz({
                title,
                timePerQuestion,
                passPercent,
              });
              handleClose();
            }}
          >
            Add Quiz
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

AddQuiz.propTypes = {
  createQuiz: PropTypes.func.isRequired,
};

export default AddQuiz;
