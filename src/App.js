import React, { useState } from "react";
import Cover from "./components/Cover";
import "./App.css";
import "./css/style.css";
import { Container } from "react-bootstrap";
import { Route, Routes } from "react-router-dom";
import { indexerClient, myAlgoConnect } from "./utils/constants";
import { Notification } from "./components/Notifications";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import coverImg from "./assets/img/speed.jpg";

const App = function AppWrapper() {
  const [address, setAddress] = useState(null);
  const [name, setName] = useState(null);
  const [balance, setBalance] = useState(0);

  const fetchBalance = async (accountAddress) => {
    indexerClient
      .lookupAccountByID(accountAddress)
      .do()
      .then((response) => {
        const _balance = response.account.amount;
        setBalance(_balance);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const connectWallet = async () => {
    myAlgoConnect
      .connect()
      .then((accounts) => {
        const _account = accounts[0];
        setAddress(_account.address);
        setName(_account.name);
        fetchBalance(_account.address);
      })
      .catch((error) => {
        console.log("Could not connect to MyAlgo wallet");
        console.error(error);
      });
  };

  const disconnect = () => {
    setAddress(null);
    setName(null);
    setBalance(null);
  };

  return (
    <>
      <Notification />
      {address ? (
        <Container fluid className="main-nav">
          <main>
            <Routes>
              <Route
                element={
                  <Home
                    address={address}
                    name={name}
                    balance={balance}
                    fetchBalance={fetchBalance}
                    disconnect={disconnect}
                  />
                }
                path="/"
              />
              <Route
                element={
                  <Quiz
                    address={address}
                    fetchBalance={fetchBalance}
                    name={name}
                    balance={balance}
                    disconnect={disconnect}
                  />
                }
                path="/quiz"
              />
              <Route element={<Result address={address} />} path="/result" />
            </Routes>
          </main>
        </Container>
      ) : (
        <Cover
          name={"Speed Quiz"}
          coverImg={coverImg}
          connect={connectWallet}
        />
      )}
    </>
  );
};

export default App;
