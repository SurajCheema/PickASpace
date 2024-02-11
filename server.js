const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models'); 
const PORT = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Environment variables for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello World! PickASpace is currently in development...');
});

// Start the server (type 'node server.js')
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
});

// Register user
app.post('/create-user', async (req, res) => {
  try {    
    // How intense the hashing will be. Higher = harder to guess but will slow down the process.
    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = await db.User.create({ 
    // Spread operator copies all other user fields
      ...req.body,
      password: hashedPassword
    });

    res.json({ message: "User created successfully", userId: newUser.user_id });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Login user
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).send('Authentication failed');
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      // Create a token if the password matches
      const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful', token }); // Send the token to the client
    } else {
      // Password does not match
      return res.status(401).send('Authentication failed');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Create a new car park
app.post('/api/create-carpark', async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    // Extract car park data from request body
    const { addressLine1, addressLine2, city, postcode, openTime, closeTime, accessInstructions, pricing, bays } = req.body;
    
    // Create car park
    const newCarPark = await db.CarPark.create({
      addressLine1,
      addressLine2,
      city,
      postcode,
      openTime,
      closeTime,
      accessInstructions,
      pricing
    }, { transaction });
    
    // Create bays associated with the car park
    for (const bay of bays) {
      await db.Bay.create({
        ...bay,
        carpark_id: newCarPark.carpark_id
      }, { transaction });
    }

    await transaction.commit();

    res.json({ message: "Car park created successfully", carparkId: newCarPark.carpark_id });
  } catch (error) {
    await transaction.rollback();
    console.error("Failed to create car park:", error);
    res.status(500).send(error.message);
  }
});
