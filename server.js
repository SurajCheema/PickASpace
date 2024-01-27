const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models'); 
const PORT = process.env.PORT || 3000;

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

app.post('/create-user', async (req, res) => {
  try {
    const newUser = await db.User.create(req.body);
    res.json(newUser);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).send('Authentication failed');
    }
    // Check password (will be editing this to hash passwords)
    if (user.password !== password) {
      return res.status(401).send('Authentication failed');
    }
    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
