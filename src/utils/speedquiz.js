import algosdk from "algosdk";

import {
  algodClient,
  indexerClient,
  speedQuizNote,
  attemptNote,
  minRound,
  myAlgoConnect,
  numGlobalBytesQuiz,
  numGlobalIntsQuiz,
  numLocalBytesQuiz,
  numLocalIntsQuiz,
  numGlobalBytesQuestion,
  numGlobalIntsQuestion,
  numLocalBytesQuestion,
  numLocalIntsQuestion,
} from "./constants";
/* eslint import/no-webpack-loader-syntax: off */
import approvalProgramQuiz from "!!raw-loader!../contracts/quiz_approval.teal";
import clearProgramQuiz from "!!raw-loader!../contracts/quiz_clear.teal";
import approvalProgramQuestion from "!!raw-loader!../contracts/question_approval.teal";
import clearProgramQuestion from "!!raw-loader!../contracts/question_clear.teal";
import { base64ToUTF8String, utf8ToBase64String } from "./conversions";

class Quiz {
  constructor(
    appId,
    appAddress,
    appCreator,
    title,
    timePerQuestion,
    totalTime,
    date,
    noOfQuestions,
    noOfAttempts,
    successfulAttempts,
    passPercent
  ) {
    this.appId = appId;
    this.appAddress = appAddress;
    this.appCreator = appCreator;
    this.title = title;
    this.timePerQuestion = timePerQuestion;
    this.totalTime = totalTime;
    this.date = date;
    this.noOfQuestions = noOfQuestions;
    this.noOfAttempts = noOfAttempts;
    this.successfulAttempts = successfulAttempts;
    this.passPercent = passPercent;
  }
}

class PlayerInfo {
  constructor(
    optedIn,
    quizAppId,
    playerHighScore,
    playerAttempts,
    playerQuizState
  ) {
    this.optedIn = optedIn;
    this.quizAppId = quizAppId;
    this.playerHighScore = playerHighScore;
    this.playerAttempts = playerAttempts;
    this.playerQuizState = playerQuizState;
  }
}

class Questions {
  constructor(appId, question, options, answer) {
    this.appId = appId;
    this.question = question;
    this.options = options;
    this.answer = answer;
  }
}

// Compile smart contract in .teal format to program
const compileProgram = async (programSource) => {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await algodClient.compile(programBytes).do();
  return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
};

// CREATE QUIZ: ApplicationCreateTxn
export const createQuizAction = async (senderAddress, quiz) => {
  console.log("Adding quiz...");

  let params = await algodClient.getTransactionParams().do();

  // Compile programs
  const compiledApprovalProgram = await compileProgram(approvalProgramQuiz);
  const compiledClearProgram = await compileProgram(clearProgramQuiz);

  // Build note to identify transaction later and required app args as Uint8Arrays
  let note = new TextEncoder().encode(speedQuizNote);
  let title = new TextEncoder().encode(quiz.title);
  let timePerQuestion = algosdk.encodeUint64(Number(quiz.timePerQuestion));
  let passPercent = algosdk.encodeUint64(Number(quiz.passPercent));

  let appArgs = [title, timePerQuestion, passPercent];

  // Create ApplicationCreateTxn
  let txn = algosdk.makeApplicationCreateTxnFromObject({
    from: senderAddress,
    suggestedParams: params,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    approvalProgram: compiledApprovalProgram,
    clearProgram: compiledClearProgram,
    numLocalInts: numLocalIntsQuiz,
    numLocalByteSlices: numLocalBytesQuiz,
    numGlobalInts: numGlobalIntsQuiz,
    numGlobalByteSlices: numGlobalBytesQuiz,
    note: note,
    appArgs: appArgs,
  });

  // Get transaction ID
  let txId = txn.txID().toString();

  // Sign & submit the transaction
  let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
  console.log("Signed transaction with txID: %s", txId);
  await algodClient.sendRawTransaction(signedTxn.blob).do();

  // Wait for transaction to be confirmed
  let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

  // Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );

  // Get created application id and notify about completion
  let transactionResponse = await algodClient
    .pendingTransactionInformation(txId)
    .do();
  let appId = transactionResponse["application-index"];
  console.log("Created new app-id: ", appId);
  return appId;
};

// CREATE Question: Group transactin consisting of ApplicationcallTxn, PaymentTxn and ApplicationCreateTxn
export const createQuestionAction = async (senderAddress, question, quiz) => {
  console.log("Adding question...");

  let params = await algodClient.getTransactionParams().do();

  // Compile programs
  const compiledApprovalProgram = await compileProgram(approvalProgramQuestion);
  const compiledClearProgram = await compileProgram(clearProgramQuestion);

  // Build note to identify transaction later and required app args as Uint8Arrays
  let quizId = `Quiz-${quiz.appId}`;
  let note = new TextEncoder().encode(quizId);
  let questionTitle = new TextEncoder().encode(question.questionTitle);
  let option1 = new TextEncoder().encode(question.option1);
  let option2 = new TextEncoder().encode(question.option2);
  let option3 = new TextEncoder().encode(question.option3);
  let option4 = new TextEncoder().encode(question.option4);
  let answer = new TextEncoder().encode(question.answer);

  let addArg = new TextEncoder().encode("add");

  let appCallTxnArgs = [addArg];

  let createAppTxnArgs = [
    questionTitle,
    option1,
    option2,
    option3,
    option4,
    answer,
  ];

  // Create ApplicationCallTxn To Quiz
  let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
    from: senderAddress,
    appIndex: quiz.appId,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    suggestedParams: params,
    appArgs: appCallTxnArgs,
  });

  // Create PaymentTxn To Quiz
  let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: senderAddress,
    to: quiz.appAddress,
    amount: 1000000,
    suggestedParams: params,
  });

  // Create ApplicationCreateTxn To question
  let createAppTxn = algosdk.makeApplicationCreateTxnFromObject({
    from: senderAddress,
    suggestedParams: params,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    approvalProgram: compiledApprovalProgram,
    clearProgram: compiledClearProgram,
    numLocalInts: numLocalIntsQuestion,
    numLocalByteSlices: numLocalBytesQuestion,
    numGlobalInts: numGlobalIntsQuestion,
    numGlobalByteSlices: numGlobalBytesQuestion,
    note: note,
    appArgs: createAppTxnArgs,
  });

  let txnArray = [appCallTxn, paymentTxn, createAppTxn];

  // Create group transaction out of previously build transactions
  let groupID = algosdk.computeGroupID(txnArray);
  for (let i = 0; i < 3; i++) txnArray[i].group = groupID;

  // Sign & submit the group transaction
  let signedTxn = await myAlgoConnect.signTransaction(
    txnArray.map((txn) => txn.toByte())
  );
  console.log("Signed group transaction");
  let tx = await algodClient
    .sendRawTransaction(signedTxn.map((txn) => txn.blob))
    .do();

  // Wait for group transaction to be confirmed
  let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);

  // Notify about completion
  console.log(
    "Group transaction " +
      tx.txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );
};

// OPT-IN: opt_in_call
export const optInAction = async (senderAddress, quiz) => {
  console.log("Opting in to contract......");

  let params = await algodClient.getTransactionParams().do();

  // Create ApplicationOptIn Transaction
  let txn = algosdk.makeApplicationOptInTxnFromObject({
    from: senderAddress,
    suggestedParams: params,
    appIndex: quiz.appId,
  });

  // Get transaction ID
  let txId = txn.txID().toString();

  // Sign & submit the transaction
  let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
  console.log("Signed transaction with txID: %s", txId);
  await algodClient.sendRawTransaction(signedTxn.blob).do();

  // Wait for transaction to be confirmed
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

  // Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );
  // display results
  let transactionResponse = await algodClient
    .pendingTransactionInformation(txId)
    .do();
  console.log("Opted-in to app-id:", transactionResponse["txn"]["txn"]["apid"]);
};

// START QUIZ: Group transaction consisting of ApplicationCallTxn and PaymentTxn
export const startQuizAction = async (senderAddress, quiz, playerInfo) => {
  console.log("Starting quiz...");

  let params = await algodClient.getTransactionParams().do();

  // Build required app args as Uint8Array
  let startArg = new TextEncoder().encode("start");
  let appArgs = [startArg];

  let appCallTxn;

  if (!playerInfo.playerAttempts) {
    let note = new TextEncoder().encode(attemptNote);
    // Create ApplicationCallTxn with note
    appCallTxn = algosdk.makeApplicationCallTxnFromObject({
      from: senderAddress,
      appIndex: quiz.appId,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      suggestedParams: params,
      appArgs: appArgs,
      note: note,
    });
  } else {
    // Create ApplicationCallTxn without notes
    appCallTxn = algosdk.makeApplicationCallTxnFromObject({
      from: senderAddress,
      appIndex: quiz.appId,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      suggestedParams: params,
      appArgs: appArgs,
    });
  }

  // Create PaymentTxn
  let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: senderAddress,
    to: quiz.appAddress,
    amount: 1000000,
    suggestedParams: params,
  });

  let txnArray = [appCallTxn, paymentTxn];

  // Create group transaction out of previously build transactions
  let groupID = algosdk.computeGroupID(txnArray);
  for (let i = 0; i < 2; i++) txnArray[i].group = groupID;

  // Sign & submit the group transaction
  let signedTxn = await myAlgoConnect.signTransaction(
    txnArray.map((txn) => txn.toByte())
  );
  console.log("Signed group transaction");
  let tx = await algodClient
    .sendRawTransaction(signedTxn.map((txn) => txn.blob))
    .do();

  // Wait for group transaction to be confirmed
  let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);

  // Notify about completion
  console.log(
    "Group transaction " +
      tx.txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );
};

// END QUIZ: ApplicationCallTxn
export const endQuizAction = async (senderAddress, score, quiz) => {
  console.log("Ending quiz...");

  let params = await algodClient.getTransactionParams().do();
  params.fee = algosdk.ALGORAND_MIN_TX_FEE * 2;
  params.flatFee = true;

  // Build required app args as Uint8Array
  let endArg = new TextEncoder().encode("end");
  let scoreArg = algosdk.encodeUint64(Number(score));
  let appArgs = [endArg, scoreArg];

  // Create ApplicationCallTxn
  let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
    from: senderAddress,
    appIndex: quiz.appId,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    suggestedParams: params,
    appArgs: appArgs,
  });
  // Get transaction ID
  let txId = appCallTxn.txID().toString();

  // Sign & submit the transaction
  let signedTxn = await myAlgoConnect.signTransaction(appCallTxn.toByte());
  console.log("Signed transaction with txID: %s", txId);
  await algodClient.sendRawTransaction(signedTxn.blob).do();

  // Wait for transaction to be confirmed
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

  // Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );
};

// DELETE QUIZ: ApplicationDeleteTxn
export const deleteQuizAction = async (senderAddress, index) => {
  console.log("Deleting application...");

  let params = await algodClient.getTransactionParams().do();

  // Create ApplicationDeleteTxn
  let txn = algosdk.makeApplicationDeleteTxnFromObject({
    from: senderAddress,
    suggestedParams: params,
    appIndex: index,
  });

  // Get transaction ID
  let txId = txn.txID().toString();

  // Sign & submit the transaction
  let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
  console.log("Signed transaction with txID: %s", txId);
  await algodClient.sendRawTransaction(signedTxn.blob).do();

  // Wait for transaction to be confirmed
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

  // Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );

  // Get application id of deleted application and notify about completion
  let transactionResponse = await algodClient
    .pendingTransactionInformation(txId)
    .do();
  let appId = transactionResponse["txn"]["txn"].apid;
  console.log("Deleted app-id: ", appId);
};

// GET QUIZZES: Use indexer
export const getQuizzesAction = async (senderAddress) => {
  console.log("Fetching your quizzess...");
  let note = new TextEncoder().encode(speedQuizNote);
  let encodedNote = Buffer.from(note).toString("base64");

  // Step 1: Get all transactions by notePrefix (+ minRound filter for performance)
  let transactionInfo = await indexerClient
    .searchForTransactions()
    .notePrefix(encodedNote)
    .txType("appl")
    .minRound(minRound)
    .address(senderAddress)
    .do();

  let quizzes = [];
  for (const transaction of transactionInfo.transactions) {
    let appId = transaction["created-application-index"];
    if (appId) {
      // Step 2: Get each application by application id
      let quiz = await getQuizApplication(appId);
      if (quiz) {
        quizzes.push(quiz);
      }
    }
  }
  console.log("Quizzes fetched.");
  return quizzes;
};

const getField = (fieldName, globalState) => {
  return globalState.find((state) => {
    return state.key === utf8ToBase64String(fieldName);
  });
};

export const getQuizApplication = async (appId) => {
  try {
    // 1. Get application by appId
    let response = await indexerClient
      .lookupApplications(appId)
      .includeAll(true)
      .do();
    if (response.application.deleted) {
      return null;
    }
    let globalState = response.application.params["global-state"];

    // 2. Parse fields of response and return quiz
    let appAddress = algosdk.getApplicationAddress(appId);
    let appCreator = response.application.params.creator;
    let title = "";
    let timePerQuestion = 0;
    let totalTime = 0;
    let date = 0;
    let noOfQuestions = 0;
    let noOfAttempts = 0;
    let successfulAttempts = 0;
    let passPercent = 0;

    if (getField("TITLE", globalState) !== undefined) {
      let field = getField("TITLE", globalState).value.bytes;
      title = base64ToUTF8String(field);
    }

    if (getField("Q-TIME", globalState) !== undefined) {
      timePerQuestion = getField("Q-TIME", globalState).value.uint;
    }

    if (getField("TIME", globalState) !== undefined) {
      totalTime = getField("TIME", globalState).value.uint;
    }

    if (getField("DATE", globalState) !== undefined) {
      date = getField("DATE", globalState).value.uint;
    }

    if (getField("QUESTIONS", globalState) !== undefined) {
      noOfQuestions = getField("QUESTIONS", globalState).value.uint;
    }

    if (getField("ATTEMPTS", globalState) !== undefined) {
      noOfAttempts = getField("ATTEMPTS", globalState).value.uint;
    }

    if (getField("S-ATTEMPTS", globalState) !== undefined) {
      successfulAttempts = getField("S-ATTEMPTS", globalState).value.uint;
    }

    if (getField("BENCHMARK", globalState) !== undefined) {
      passPercent = getField("BENCHMARK", globalState).value.uint;
    }

    return new Quiz(
      appId,
      appAddress,
      appCreator,
      title,
      timePerQuestion,
      totalTime,
      date,
      noOfQuestions,
      noOfAttempts,
      successfulAttempts,
      passPercent
    );
  } catch (err) {
    return null;
  }
};

// GET PlayerInfo: Use indexer
export const getPlayerHistoryAction = async (senderAddress) => {
  console.log("Fetching your history info...");
  let note = new TextEncoder().encode(attemptNote);
  let encodedNote = Buffer.from(note).toString("base64");

  // Step 1: Get all transactions by notePrefix (+ minRound filter for performance)
  let transactionInfo = await indexerClient
    .searchForTransactions()
    .notePrefix(encodedNote)
    .txType("appl")
    .minRound(minRound)
    .address(senderAddress)
    .do();

  let playerInfo = [];
  for (const transaction of transactionInfo.transactions) {
    let appId = transaction["application-transaction"]["application-id"];
    if (appId) {
      // Step 2: Get each application by application id
      let _info = await getInfo(appId, senderAddress);
      if (_info) {
        playerInfo.push(_info);
      }
    }
  }
  console.log("info fetched.");
  return playerInfo;
};

export const getInfo = async (quizAppId, senderAddress) => {
  let playerInfo = await indexerClient
    .lookupAccountAppLocalStates(senderAddress)
    .do();

  let optedIn = false;
  let playerHighScore = 0;
  let playerAttempts = 0;
  let playerQuizState = 0;

  let appLocalState = playerInfo["apps-local-states"];

  for (let i = 0; i < appLocalState.length; i++) {
    if (quizAppId === appLocalState[i]["id"]) {
      optedIn = true;
      let localState = appLocalState[i]["key-value"];
      if (getField("SCORE", localState) !== undefined) {
        playerHighScore = getField("SCORE", localState).value.uint;
      }
      if (getField("P-ATTEMPTS", localState) !== undefined) {
        playerAttempts = getField("P-ATTEMPTS", localState).value.uint;
      }
      if (getField("STATE", localState) !== undefined) {
        playerQuizState = getField("STATE", localState).value.uint;
      }
    }
  }

  return new PlayerInfo(
    optedIn,
    quizAppId,
    playerHighScore,
    playerAttempts,
    playerQuizState
  );
};

// GET Questions: Use indexer
export const getQuestionsAction = async (quizAppId) => {
  console.log(`Fetching your questions for ${quizAppId}...`);

  let note = new TextEncoder().encode(quizAppId);
  let encodedNote = Buffer.from(note).toString("base64");

  // Step 1: Get all transactions by notePrefix (+ minRound filter for performance)
  let transactionInfo = await indexerClient
    .searchForTransactions()
    .notePrefix(encodedNote)
    .txType("appl")
    .minRound(minRound)
    .do();

  let questions = [];
  for (const transaction of transactionInfo.transactions) {
    let appId = transaction["created-application-index"];
    if (appId) {
      // Step 2: Get each application by application id
      let question = await getQuestionApplications(appId);
      if (question) {
        questions.push(question);
      }
    }
  }
  console.log("Questions fetched.");
  return questions;
};

const getQuestionApplications = async (appId) => {
  try {
    // 1. Get application by appId
    let response = await indexerClient
      .lookupApplications(appId)
      .includeAll(true)
      .do();
    if (response.application.deleted) {
      return null;
    }
    let globalState = response.application.params["global-state"];

    // 2. Parse fields of response and return quiz
    let question = "";
    let options = [];
    let answer = "";

    if (getField("QUESTION", globalState) !== undefined) {
      let field = getField("QUESTION", globalState).value.bytes;
      question = base64ToUTF8String(field);
    }

    if (getField("OPTION1", globalState) !== undefined) {
      let field = getField("OPTION1", globalState).value.bytes;
      options.push(base64ToUTF8String(field));
    }
    if (getField("OPTION2", globalState) !== undefined) {
      let field = getField("OPTION2", globalState).value.bytes;
      options.push(base64ToUTF8String(field));
    }
    if (getField("OPTION3", globalState) !== undefined) {
      let field = getField("OPTION3", globalState).value.bytes;
      options.push(base64ToUTF8String(field));
    }
    if (getField("OPTION4", globalState) !== undefined) {
      let field = getField("OPTION4", globalState).value.bytes;
      options.push(base64ToUTF8String(field));
    }
    if (getField("ANSWER", globalState) !== undefined) {
      let field = getField("ANSWER", globalState).value.bytes;
      answer = base64ToUTF8String(field);
    }

    return new Questions(appId, question, options, answer);
  } catch (err) {
    return null;
  }
};
