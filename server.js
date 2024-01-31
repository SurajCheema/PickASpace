const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models'); 
const PORT = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Environment variables for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

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
    if (!match) {
      return res.status(401).send('Authentication failed');
    }

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).send(error.message);
  }

  if (match) {
    // Create a token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } else {
    return res.status(401).send('Authentication failed');
  }

});
