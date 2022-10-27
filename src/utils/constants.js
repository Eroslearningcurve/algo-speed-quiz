import algosdk from "algosdk";
import MyAlgoConnect from "@randlabs/myalgo-connect";

const config = {
  algodToken: "",
  algodServer: "https://node.testnet.algoexplorerapi.io",
  algodPort: "",
  indexerToken: "",
  indexerServer: "https://algoindexer.testnet.algoexplorerapi.io",
  indexerPort: "",
};

export const algodClient = new algosdk.Algodv2(
  config.algodToken,
  config.algodServer,
  config.algodPort
);

export const indexerClient = new algosdk.Indexer(
  config.indexerToken,
  config.indexerServer,
  config.indexerPort
);

export const myAlgoConnect = new MyAlgoConnect();

export const minRound = 21540981;

// https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0002.md
export const speedQuizNote = "speed-quiz-dapp:uv1";

// Maximum local storage allocation, immutable
export const numLocalIntsQuiz = 3;
export const numLocalBytesQuiz = 0;
// Maximum global storage allocation, immutable
export const numGlobalIntsQuiz = 7; // Global variables stored as Int:
export const numGlobalBytesQuiz = 1; // Global variables stored as Bytes:

// Maximum local storage allocation, immutable
export const numLocalIntsQuestion = 0;
export const numLocalBytesQuestion = 0;
// Maximum global storage allocation, immutable
export const numGlobalIntsQuestion = 0; // Global variables stored as Int: count, sold
export const numGlobalBytesQuestion = 6; // Global variables stored as Bytes: name, description, image

export const ALGORAND_DECIMALS = 6;

export const testQuiz = {
  appId: 0,
  appAddress: 0,
  appCreator: "0xoxxixiixx",
  title: "General quizzes for testing purposes - part 1",
  timePerQuestion: "20",
  totalTime: "100",
  date: "Mon, 24 Jan 2022 11:41:13 GMT",
  noOfQuestions: 5,
  noOfAttempts: 2,
  successfulAttempts: 1,
};

export const testPlayerInfo = {
  playerHighScore: 15,
  playerAttempts: 2,
  playerQuizState: 0,
};

export const testQuestions = [
  {
    id: "af0153c2-9860-48f2-bfd2-641111d59214",
    question: "Which Dutch artist painted “Girl with a Pearl Earring”?",
    options: ["Madona", "Vermeer", "Pandora", "Eve"],
    answer: "VmVybWVlcg==",
  },
  {
    id: "17870cb8-12fb-447e-82ed-78c655e5dfd7",
    question: "Which country consumes the most chocolate per capita?",
    options: ["Switzerland", "U.S", "Netherlands", "Africa"],
    answer: "U3dpdHplcmxhbmQ=",
  },
  {
    id: "130f4b45-4925-4fa5-8ac2-9af6d59a330d",
    question: "Which two U.S. states don’t observe Daylight Saving Time?",
    options: [
      "Arizona and Hawaii",
      "Nevada and Hawaii",
      "Arizona and New York",
      "Dallas and New York",
    ],
    answer: "QXJpem9uYSBhbmQgSGF3YWlp",
  },
  {
    id: "bb9413cd-9c7e-429a-b311-a717608b192b",
    question: "What is the loudest animal on Earth?",
    options: ["The sperm whale", "Blue whale", "Mamooth", "The rhino"],
    answer: "VGhlIHNwZXJtIHdoYWxl",
  },
  {
    id: "d2652c20-bbba-4e50-b962-d32d77917f47",
    question: "What was the first toy to be advertised on television?",
    options: ["Mr. Potato Head", "Nightmare toys", "A. A. Toys", "Super Toys"],
    answer: "TXIuIFBvdGF0byBIZWFk",
  },
];

export const testQuestions1 = [];
