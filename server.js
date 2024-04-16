const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models'); 
const PORT = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const { Op } = require('sequelize');
require('dotenv').config();

// Environment variables for JWT
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not defined. Check your .env file and environment variables.');
  process.exit(1); // Exit the application if the JWT_SECRET is not defined
}


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

    const {
      car_registration,
      first_name,
      last_name,
      email,
      password,
      phone,
      DOB
    } = req.body;

    // How intense the hashing will be. Higher = harder to guess but will slow down the process.
    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = await db.User.create({
      car_registration,
      first_name,
      last_name,
      email,
      password: hashedPassword,
      phone, // Include phone field
      DOB
    });

    res.json({ message: "User created successfully", userId: newUser.user_id });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).send('Detailed Error: ' + error.message + ' | Stack: ' + error.stack);
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

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Bearer TOKEN
  const token = authHeader && authHeader.split(' ')[1]; 
  // No token found
  if (token == null) return res.sendStatus(401); 

  jwt.verify(token, JWT_SECRET, (err, user) => {
    // Token not valid
    if (err) return res.sendStatus(403); 

    console.log(user); // Log the decoded user payload
    req.user = user;
    next();
  });
};

// Create a new car park
app.post('/api/create-carpark', authenticateToken, async (req, res) => {

  console.log(req.user); // Log to confirm the structure

  // Extracted from the token by the middleware
  const user_id = req.user.userId;

  const transaction = await db.sequelize.transaction();
  try {
    const { addressLine1, addressLine2, city, postcode, openTime, closeTime, accessInstructions, pricing, bays } = req.body;

    // Create car park with dynamic user_id from JWT
    const newCarPark = await db.CarPark.create({
      user_id,
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

// Get all carparks with optional address filtering
app.get('/api/carparks', async (req, res) => {
  console.log("Search Query:", req.query.query); // Debug incoming query
  const { query } = req.query;
  try {
    const whereClause = {
      [db.Sequelize.Op.or]: [
        { addressLine1: { [db.Sequelize.Op.iLike]: `%${query}%` } },
        { addressLine2: { [db.Sequelize.Op.iLike]: `%${query}%` } },
        { city: { [db.Sequelize.Op.iLike]: `%${query}%` } },
        { postcode: { [db.Sequelize.Op.iLike]: `%${query}%` } },
      ],
    };

    const carParks = await db.CarPark.findAll({ where: whereClause });
    res.json(carParks);
  } catch (error) {
    console.error('Failed to fetch car parks:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch bays for a specific car park
app.get('/api/carparks/:carparkId/bays', async (req, res) => {
  try {
    const { carparkId } = req.params; // Extract carparkId from URL parameters
    const bays = await db.Bay.findAll({
      where: { carpark_id: carparkId }
    });

    if (bays) {
      res.json(bays);
    } else {
      res.status(404).send('Bays not found');
    }
  } catch (error) {
    console.error('Failed to fetch bays:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch details of a specific car park by its ID along with all associated bays
app.get('/api/carparks/:carparkId', authenticateToken, async (req, res) => {
  const { carparkId } = req.params;
  
  try {
    const carPark = await db.CarPark.findOne({
      where: { carpark_id: carparkId },
      include: [{
        model: db.Bay,
        as: 'bays',
        attributes: ['bay_id', 'bay_number', 'vehicleSize', 'hasEVCharging', 'disabled', 'description']
      }]
    });

    if (!carPark) {
      return res.status(404).send('Car park not found');
    }

    res.json(carPark);
  } catch (error) {
    console.error('Failed to fetch car park details:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Book a bay endpoint (adding to CarParkLog)
app.post('/api/book-bay', authenticateToken, async (req, res) => {
  // Extract booking details from the request body
  const { bay_id, carpark_id, startTime, endTime, cost } = req.body;
  const user_id = req.user.userId;

  // Validate the provided cost
  if (typeof cost !== 'number' || cost <= 0) {
    return res.status(400).json({ error: "Invalid cost provided." });
  }

  // Check for existing bookings that might overlap with the requested time
  const overlappingBookings = await db.CarParkLog.count({
    where: {
      bay_id,
      [Op.or]: [
        {
          [Op.and]: [
            { startTime: { [Op.lt]: endTime } },
            { endTime: { [Op.gt]: startTime } }
          ]
        }
      ]
    }
  });

  // If overlapping bookings are found, return an error
  if (overlappingBookings > 0) {
    return res.status(400).json({ error: "The requested time slot for the bay is already booked." });
  }

  // Proceed to create the booking if no overlap is found
  try {
    const booking = await db.CarParkLog.create({
      bay_id,
      carpark_id,
      user_id,
      startTime,
      endTime,
      cost
    });
    res.json({ message: "Booking successful", bookingId: booking.log_id, cost: booking.cost });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "An error occurred while booking the bay." });
  }
});

// Schedule a task to run every minute
cron.schedule('* * * * *', async () => {
  console.log('Running a task every minute to check for expired bookings');

  const now = new Date();
  const expiredBookings = await db.CarParkLog.findAll({
      where: {
          endTime: {
              [Op.lt]: now // endTime is less than current time
          },
      },
      include: [{
          model: db.Bay,
          as: 'bay',
          where: {
              isAvailable: false // Only include bookings where the associated bay is not already marked as available
          }
      }]
  });

  for (const booking of expiredBookings) {
      await db.Bay.update({ isAvailable: true }, { 
          where: { 
              bay_id: booking.bay_id,
              isAvailable: false // Double-check to avoid unnecessary updates
          } 
      });
  }
});

// Check for bay availability
app.get('/api/bays/:bayId/availability', async (req, res) => {
  const { bayId } = req.params;
  const { startTime, endTime } = req.query;

  try {
    const overlappingBookings = await db.CarParkLog.count({
      where: {
        bay_id: bayId,
        [Op.or]: [
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime },
          },
        ],
      },
    });

    const isAvailable = overlappingBookings === 0;
    res.json({ isAvailable });
  } catch (error) {
    console.error('Error checking bay availability:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Update user details
app.post('/api/update-user', authenticateToken, async (req, res) => {
  const { userId } = req.user; // Extracted from the JWT

  const { phone, address, first_name, last_name, email, DOB, car_registration, password } = req.body;
  const updatedFields = {
    phone,
    address,
    first_name,
    last_name,
    email,
    DOB,
    car_registration,
    password
  };

  if (password) {
    const saltRounds = 10;
    updatedFields.password = await bcrypt.hash(password, saltRounds);
  }

  console.log('Attempting to update user:', userId, updatedFields);

  try {
    // Start a transaction
    const transaction = await db.sequelize.transaction();

    // Update user with validation and transaction control
    const result = await db.User.update(updatedFields, { 
      where: { user_id: userId },
      transaction
    });

    await transaction.commit(); // Commit the transaction if all goes well

    if (result[0] === 1) { // Check if the update was successful
      res.json({ message: 'User updated successfully' });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    if (transaction) await transaction.rollback(); // Rollback transaction on error
    console.error('Failed to update user:', error);
    res.status(500).send(error.message);
  }
});

// Endpoint to fetch user details
app.get('/user-details', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userDetails = await db.User.findByPk(userId);
    if (userDetails) {
      res.json(userDetails);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).send('Internal Server Error');
  }
});
