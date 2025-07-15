const express = require("express");
const bodyParser = require("body-parser");
const {Web3} = require("web3");
const fs = require("fs");
const path = require("path");
const connectDB = require('../config/db');
const locationRoutes = require('../routes/locationRoutes');
const electionRoutes = require('../routes/electionRoutes');
const candidateRoutes = require('../routes/candidateRoutes');
const voteRoutes = require('../routes/voteRoutes');
const userRoutes = require('../routes/userRoutes');

// ======= CONFIGURATION =======
const ABI_PATH = "./artifacts/contracts/ElectionSystem.sol/ElectionSystem.json";

const ADDR_PATH = path.join(__dirname, "deployedAddress.json");

if (!fs.existsSync(ADDR_PATH)) {
  throw new Error("Contract address not found. Please deploy the contract first.");
}

const { address: CONTRACT_ADDRESS } = JSON.parse(fs.readFileSync(ADDR_PATH));
const contractJson = JSON.parse(fs.readFileSync(ABI_PATH));

// ======= SETUP =======
const app = express();
app.use(bodyParser.json());

connectDB();

// Routes
app.use('/locations', locationRoutes);
app.use('/users', userRoutes);
app.use('/elections', electionRoutes);
app.use('/candidates', candidateRoutes);
app.use('/votes', voteRoutes);

const web3 = new Web3("http://127.0.0.1:8545"); // Hardhat local node
const contract = new web3.eth.Contract(contractJson.abi, CONTRACT_ADDRESS);

// Automatically use the first account
let defaultAccount;

web3.eth.getAccounts().then(accounts => {
  defaultAccount = accounts[0];
  console.log("Using default account:", defaultAccount);
});

// ========== API Routes ==========
// ➕ Add Location
app.post("/location", async (req, res) => {
  try {
    const { name } = req.body;
    const tx = await contract.methods.addLocation(name).send({ from: defaultAccount });
    res.json({ txHash: tx.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👤 Register User
app.post("/user", async (req, res) => {
  try {
    const { name, email, locationId } = req.body;
    const tx = await contract.methods
      .registerUser(name, email, locationId)
      .send({ from: defaultAccount });
    res.json({ txHash: tx.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🗳️ Create Election
app.post("/election", async (req, res) => {
  try {
    const { title, description, locationId, startTime, endTime } = req.body;
    const tx = await contract.methods
      .createElection(title, description, locationId, startTime, endTime)
      .send({ from: defaultAccount });
    res.json({ txHash: tx.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧑‍💼 Add Candidate
app.post("/candidate", async (req, res) => {
  try {
    const { name, bio, electionId } = req.body;
    const tx = await contract.methods
      .addCandidate(name, bio, electionId)
      .send({ from: defaultAccount });
    res.json({ txHash: tx.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🗳️ Vote
app.post("/vote", async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const tx = await contract.methods
      .vote(electionId, candidateId)
      .send({ from: defaultAccount });
    res.json({ txHash: tx.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Get Vote Count
app.get("/vote-count/:electionId/:candidateId", async (req, res) => {
  try {
    const { electionId, candidateId } = req.params;
    const count = await contract.methods.getVoteCount(electionId, candidateId).call();
    res.json({ voteCount: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📍 Get Location
app.get("/location/:id", async (req, res) => {
  try {
    const location = await contract.methods.locations(req.params.id).call();
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🗳️ Get Election
app.get("/election/:id", async (req, res) => {
  try {
    const election = await contract.methods.elections(req.params.id).call();
    res.json(election);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== START SERVER ==========
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Election API running at http://localhost:${PORT}`);
});
