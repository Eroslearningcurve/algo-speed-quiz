import { useEffect, useState } from "react";

const useCountdown = (targetSeconds, done) => {
  const [countDown, setCountDown] = useState(targetSeconds - 1);

  useEffect(() => {
    if (!done) {
      const interval = setInterval(() => {
        setCountDown(countDown - 1);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [done, countDown]);

  function payPenalty() {
    setCountDown(countDown - 10);
  }

  function reset() {
    setCountDown(targetSeconds - 1);
  }

  return { countDown, payPenalty, reset };
};

export { useCountdown };
