import Wallet from "../Wallet";
import PropTypes from "prop-types";
import { Dropdown, Nav } from "react-bootstrap";
import { getDate } from "../../utils/conversions";

const NavBarQuiz = ({ address, name, quizInfo, balance, disconnect }) => {
  const { title, totalTime, timePerQuestion, date } = quizInfo;
  return (
    <>
      <Nav className="navbar justify-content-between pt-3 bg-dark navbar-light quiz-nav">
        <Nav.Item>
          <Dropdown>
            <Dropdown.Toggle
              variant="light"
              id="dropdown-basic"
              className="d-flex align-items-center border  py-1"
            >
              Rules
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-lg border-0">
              <Dropdown.Item>
                {" "}
                Max time to solve quiz is {totalTime} seconds
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item>
                Max time to solve one question is {timePerQuestion} seconds
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav.Item>
        <Nav.Item>
          <div>
            <h3 id="quiz-title">{title}</h3>
            <p id="created-at">{getDate(date)}</p>
          </div>
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

NavBarQuiz.propTypes = {
  address: PropTypes.string,
  name: PropTypes.string,
  quizInfo: PropTypes.instanceOf(Object).isRequired,
  balance: PropTypes.number,
  disconnect: PropTypes.func.isRequired,
};

export default NavBarQuiz;
