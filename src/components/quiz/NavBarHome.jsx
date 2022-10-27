import React from "react";
import PropTypes from "prop-types";
import Wallet from "../Wallet";
import { Nav } from "react-bootstrap";
import AddQuiz from "./AddQuiz";
import YourHistory from "./YourHistory";
import YourQuizzes from "./YourQuizzes";

const NavBarHome = ({
  address,
  name,
  balance,
  quizzes,
  playerHistory,
  createQuiz,
  deleteQuiz,
  disconnect,
}) => {
  return (
    <>
      <Nav className="navbar justify-content-between pt-3 bg-dark navbar-light">
        <Nav.Item>
          <a
            className="navbar-brand m-0 h4 fw-bold"
            style={{ color: "white", padding: "10px" }}
            href="/#"
          >
            Speed Quiz
          </a>
        </Nav.Item>
        <Nav.Item>
          <AddQuiz createQuiz={createQuiz} />
        </Nav.Item>
        <Nav.Item>
          <YourQuizzes playerQuizzes={quizzes} deleteQuiz={deleteQuiz} />
        </Nav.Item>
        <Nav.Item>
          <YourHistory playerHistory={playerHistory} />
        </Nav.Item>
        <Nav.Item>
          <Wallet
            address={address}
            name={name}
            amount={balance}
            disconnect={disconnect}
            symbol={"ALGO"}
          />
        </Nav.Item>
      </Nav>
    </>
  );
};

NavBarHome.propTypes = {
  address: PropTypes.string,
  name: PropTypes.string,
  balance: PropTypes.number,
  quizzes: PropTypes.instanceOf(Array),
  playerHistory: PropTypes.instanceOf(Array),
  createQuiz: PropTypes.func.isRequired,
  deleteQuiz: PropTypes.func.isRequired,
  disconnect: PropTypes.func.isRequired,
};

export default NavBarHome;
