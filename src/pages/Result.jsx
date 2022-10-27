import React from "react";
import PropTypes from "prop-types";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

const Result = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  let score = searchParams.get("score");

  const backHome = () =>
    navigate({
      pathname: "/",
    });

  return (
    <>
      <section className="result-section">
        <div
          className="container-sm"
          style={{ width: "350px", height: "350px" }}
        >
          <h3>Your Score:</h3>
          <h5 id="result">{score}%</h5>
          <h5 id="feedback" style={{ padding: "10px" }}>
            {score <= 70 ? "Oops try Again" : "🎉 Congratulations you made it"}
          </h5>
          <Button variant="primary" onClick={() => backHome()}>
            Go Back Home
          </Button>
        </div>
      </section>
    </>
  );
};

Result.propTypes = {
  address: PropTypes.string,
};

export default Result;
