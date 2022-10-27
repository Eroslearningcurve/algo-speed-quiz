import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, Table, Modal } from "react-bootstrap";
import { getDate } from "../../utils/conversions";

const YourQuizzes = ({ playerQuizzes, deleteQuiz }) => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleShow = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const findQuiz = (appId) => {
    let quizId = `Quiz-${appId}`;
    navigate({
      pathname: "/quiz",
      search: `?quizId=${quizId}`,
    });
  };

  return (
    <>
      <a
        className="btn nav-link m-0"
        style={{ color: "white", padding: "10px" }}
        onClick={handleShow}
        href="/#"
      >
        Your Quizzes
      </a>
      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Your Quizzes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table
            style={{
              color: "white",
            }}
            responsive="lg"
            size="xl"
          >
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Quiz ID</th>
                <th scope="col">Quiz Title</th>
                <th scope="col">Date Created</th>
                <th scope="col">Number of Questions</th>
                <th scope="col">Successful Attempts</th>
                <th scope="col">Total Attempts</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody id="playerQuizzes">
              {playerQuizzes ? (
                playerQuizzes.map((quiz, index) => (
                  <tr key={index} className="align-middle">
                    <td id="id">{index}</td>
                    <td id="appId">
                      <Button
                        variant="outline-dark"
                        onClick={() => findQuiz(quiz.appId)}
                        style={{ border: "none" }}
                      >
                        <u>{`Quiz-${quiz.appId}`}</u>
                      </Button>
                    </td>
                    <td id="quizTitle">{quiz.title}</td>
                    <td id="quizDate">{getDate(quiz.date)}</td>
                    <td id="quizQuestions">{quiz.noOfQuestions}</td>
                    <td id="successfulAttempts">{quiz.successfulAttempts}</td>
                    <td id="recordDate">{quiz.noOfAttempts}</td>
                    <td id="action">
                      <Button
                        variant="outline-danger"
                        onClick={() => {
                          deleteQuiz(quiz.appId);
                        }}
                        className="btn"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <></>
              )}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

YourQuizzes.propTypes = {
  playerQuizzes: PropTypes.instanceOf(Array).isRequired,
  deleteQuiz: PropTypes.func.isRequired,
};

export default YourQuizzes;
