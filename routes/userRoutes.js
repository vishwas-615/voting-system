const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/Users');
const Location = require('../models/Location');
const { getContractAndDefaultAccount, web3 } = require('../scripts/contractConfig');

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 */
// 👤 Register User
router.post("/", async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const locationDoc = await Location.findOne({ name: location });
    if (!locationDoc) {
      return res.status(404).json({ message: 'Location not found' });
    } 

    // Get all accounts and pick one not used yet
    const { contract } = await getContractAndDefaultAccount();
    const accounts = await web3.eth.getAccounts();
    let usedAddresses = await User.find().distinct('ethAddress');
    let userEthAddress = accounts.find(acc => !usedAddresses.includes(acc));
    if (!userEthAddress) {
      return res.status(500).json({ message: 'No available Ethereum accounts' });
    }

    // Register user on-chain
    await contract.methods
      .registerUser(name, email, password, locationDoc._id.toString())
      .send({ from: userEthAddress });

    // Save only email and ethAddress in MongoDB
    const user = new User({ email, ethAddress: userEthAddress });
    await user.save();

    res.json({ message: 'User registered', ethAddress: userEthAddress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get user by email
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: The email of the user to retrieve
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 locationId:
 *                   type: string
 *                 exists:
 *                   type: boolean
 */
// Get user by email , users?email=v@example.com
router.get('/', async (req, res) => {
  try {
    const { contract } = await getContractAndDefaultAccount();
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Call the smart contract function
    const userDetail = await contract.methods.getUserByEmail(email).call();

    // userDetail is an object with keys: name, email, password, locationId, exists
    // You may want to avoid sending the password back!
    if (!userDetail.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userDetail);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});


/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/all', async (req, res) => {
  try {
    const { contract } = await getContractAndDefaultAccount();
    const users = await contract.methods.getAllUsers().call();

    // users: { names: [...], emails: [...], locationIds: [...], existsArr: [...] }
    const userList = users.names.map((name, idx) => ({
      name,
      email: users.emails[idx],
      locationId: users.locationIds[idx],
      exists: users.existsArr[idx]
    }));

    res.json(userList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Register user with location name and password
// router.post('/', async (req, res) => {
//   try {
//     const { name, email, password, location } = req.body;

//     // Check if email is already registered
//     const exists = await User.findOne({ email });
//     if (exists) {
//       return res.status(400).json({ message: 'Email already registered' });
//     }

//     // Find location by name
//     const locationDoc = await Location.findOne({ name: location });
//     if (!locationDoc) {
//       return res.status(404).json({ message: 'Location not found' });
//     }

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const password_hash = await bcrypt.hash(password, salt);

//     // Create new user
//     const user = new User({
//       name,
//       email,
//       password_hash,
//       location_id: locationDoc._id
//     });

//     await user.save();
//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       location: locationDoc.name
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error creating user' });
//   }
// });

// POST /users/login - Login user
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' });
//     }

//     // Find user by email
//     const user = await User.findOne({ email }).populate('location_id', 'name');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Compare passwords
//     const isMatch = await bcrypt.compare(password, user.password_hash);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid password' });
//     }

//     // Successful login response (without password hash)
//     res.json({
//       message: 'Login successful',
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         location: user.location_id.name
//       }
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Login error' });
//   }
// });




// // Get all users
// router.get('/', async (req, res) => {
//   try {
//     const users = await User.find().populate('location_id', 'name');
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching users' });
//   }
// });


module.exports = router;
