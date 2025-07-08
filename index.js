const express = require('express');
const connectDB = require('./config/db');
const locationRoutes = require('./routes/locationRoutes');
const electionRoutes = require('./routes/electionRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const voteRoutes = require('./routes/voteRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use('/locations', locationRoutes);
app.use('/users', userRoutes);
app.use('/elections', electionRoutes);
app.use('/candidates', candidateRoutes);
app.use('/votes', voteRoutes);

// Root
app.get('/', (req, res) => {
  res.send('Voting System API running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
