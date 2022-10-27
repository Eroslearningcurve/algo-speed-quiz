import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, Table, Modal } from "react-bootstrap";

const YourHistory = ({ playerHistory }) => {
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
        Your History
      </a>
      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Your History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table
            style={{
              color: "white",
            }}
            responsive="lg"
            size="lg"
          >
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Quiz ID</th>
                <th scope="col">No of Attempts</th>
                <th scope="col">Highest Score (%)</th>
              </tr>
            </thead>
            <tbody id="playerHistory">
              {playerHistory ? (
                playerHistory.map((record, index) => (
                  <tr key={index} className="align-middle">
                    <td id="id">{index}</td>
                    <td id="appId">
                      <Button
                        variant="outline-dark"
                        onClick={() => findQuiz(record.quizAppId)}
                        style={{ border: "none" }}
                      >
                        <u>{`Quiz-${record.quizAppId}`}</u>
                      </Button>
                    </td>
                    <td id="recordDate">{record.playerAttempts}</td>
                    <td id="score">{record.playerHighScore}</td>
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

YourHistory.propTypes = {
  playerHistory: PropTypes.instanceOf(Array).isRequired,
};

export default YourHistory;
