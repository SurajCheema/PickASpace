const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models');
const PORT = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const { Op, or } = require('sequelize');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const axios = require('axios');
const fetch = require('node-fetch');
const { Sequelize } = require('sequelize');
const config = require('./config/config.json');

require('dotenv').config();
console.log('Timezone set to:', process.env.TZ);

// Select the environment based on process.env.NODE_ENV, default to development
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create a new Sequelize instance
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  logging: false,
  timezone: '+00:00',  // Set the timezone to UTC
});

module.exports = sequelize;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_G,
    pass: process.env.APP_PASS
  }
});

app.use(express.static(path.join(__dirname, 'pickaspace-front-end')));

// Environment variables for JWT
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not defined. Check your .env file and environment variables.');
  process.exit(1); // Exit the application if the JWT_SECRET is not defined
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not defined. Check your .env file.');
  process.exit(1);  // Exit the application if the STRIPE_SECRET_KEY is not defined
}

// Function to verify if the Stripe onboarding process is complete
async function verifyStripeOnboarding(stripeAccountId) {
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    return account.details_submitted;
  } catch (error) {
    console.error('Failed to verify Stripe onboarding:', error);
    throw new Error('Stripe verification failed');
  }
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

// Authentication Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Authentication failed: No token provided');
    return res.status(401).send('Token is required');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(`Token verification failed: ${err.message}`);
      return res.status(403).send('Invalid Token');
    }

    console.log(`Token verified successfully: User ID ${user.userId} with role ${user.role}`);
    req.user = user;
    next();
  });
};

// Middleware to verify user role
const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      console.log(`Access denied: User role ${req.user.role} not permitted on this route`);
      return res.status(403).send('Access denied: You do not have permission to access this resource');
    }
    console.log(`Access granted for user role ${req.user.role}`);
    next();
  };
};



// Function to fetch vehicle details from the DVLA API
async function getVehicleDetails(registrationNumber) {
  try {
    const apiKey = process.env.DVLA_TEST_API_KEY;
    const apiUrl = 'https://uat.driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles';

    const response = await axios.post(apiUrl, { registrationNumber }, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle details:', error.response.data);
    throw error;
  }
}

app.post('/api/vehicle-proxy/:registrationNumber', async (req, res) => {
  const { registrationNumber } = req.params;
  const url = 'https://uat.driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.DVLA_TEST_API_KEY,
      },
      body: JSON.stringify({ registrationNumber }),
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    res.status(500).send('Failed to fetch vehicle data');
  }
});

// Register user and create a Stripe connected account if necessary
app.post('/create-user', async (req, res) => {

  const { email } = req.body;
  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: 'An account with this email already exists.' });
  }
  
  try {
    const {
      car_registration,
      first_name,
      last_name,
      email,
      password,
      phone,
      DOB,
      role = 'user', // Default role is 'user'
      blueBadge
    } = req.body;

    const nameRegex = /^[A-Za-z]+(?:[ ]?[A-Za-z]+)*$/;

    if (!nameRegex.test(first_name) || !nameRegex.test(last_name)) {
      return res.status(400).json({ message: "Names must not contain special characters, start, or end with spaces." });
    }

    // Validate non-empty fields
    if (!first_name.trim() || !last_name.trim() || !email.trim() || !password.trim()) {
      return res.status(400).send({ message: "Required fields must not be empty." });
    }

    // Validate age
    const dob = new Date(DOB);
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 16) {
      return res.status(400).send({ message: "You must be at least 16 years old to register." });
    }

    // Validate vehicle registration number using test data
    const vehicleDetails = await getVehicleDetails(car_registration);

    // Check if the vehicle is electric
    const isElectric = vehicleDetails.fuelType === 'ELECTRIC';

    // How intense the hashing will be
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in your DB
    const newUser = await db.User.create({
      car_registration,
      first_name,
      last_name,
      email,
      password: hashedPassword,
      phone,
      DOB,
      role,
      blueBadge
    });

    // Create a Stripe connected account for the user if they might be a carpark owner
    let stripeAccountId = null;
    if (role === 'user') {  // Assume all users might rent out their spaces
      const account = await stripe.accounts.create({
        type: 'express',
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;
      // Save the Stripe account ID in your DB linked to the user
      await db.User.update({ stripe_account_id: stripeAccountId }, { where: { user_id: newUser.user_id } });
    }

    res.json({
      message: "User created successfully",
      userId: newUser.user_id,
      role: newUser.role,
      isElectric,
      hasBlueBadge: blueBadge,
      stripeAccountId
    });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(error.response && error.response.status || 500).send(error.response ? error.response.data : 'Detailed Error: ' + error.message + ' | Stack: ' + error.stack);
  }
});

// Endpoint to onboard customers onto my stripe page so they can claim their revenue from their carparks
app.get('/api/create-onboarding-link', authenticateToken, async (req, res) => {
  const userId = req.user.userId; // Get the user ID from the authenticated user
  try {
    const user = await db.User.findByPk(userId);
    console.log("User data retrieved:", user);

    if (!user || !user.stripe_account_id) {
      console.error('No user or Stripe account ID found', { userId, user });
      return res.status(400).json({ error: 'No Stripe account ID found for user.' });
    }

    const accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: 'http://localhost:8080/reauth',
      return_url: 'http://localhost:8080/dashboard',
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Failed to create onboarding link:', error);
    res.status(500).send('Failed to create onboarding link: ' + error.message);
  }
});

// Endpoint to create a Stripe account for the customer
app.post('/api/create-customer', async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      email: req.body.email,
      name: req.body.name,
      source: req.body.stripeToken
    });
    res.json(customer);
  } catch (error) {
    console.error('Failed to create Stripe customer:', error);
    res.status(500).send('Failed to create customer');
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
      const token = jwt.sign({ userId: user.user_id, role: user.role, stripeAccountId: user.stripe_account_id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful', token }); // Send the token to the client
    } else {
      // Password does not match
      return res.status(401).send('Authentication failed');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/request-password-reset', async (req, res) => {
  console.log("TRYING TO RESET PASSWORD");
  const { email } = req.body;

  const user = await db.User.findOne({ where: { email } });
  console.log(user);

  if (!user) {
    return res.status(404).json({ error: 'No account with that email found.' });
  }

  const token = crypto.randomBytes(20).toString('hex');

  user.reset_password_token = token;
  user.reset_password_expires = Date.now() + 900000; // 15 minutes from now (900000 milliseconds = 15 minutes)

  await user.save().catch(err => {
    console.error('Error saving user:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  });

  const mailOptions = {
    to: email,
    from: 'johnredgolf16@gmail.com',
    subject: 'Password Reset PickASpace',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account, on PickASpace.\n\n` +
      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
      `http://localhost:8080/reset-password/${token}\n\n` +
      `This link will expire in 15 minutes. Please ensure to reset your password within this timeframe.\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged.\n`
  };

  console.log("Email ready to be sent");

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("ERROR: " + error);
      return res.status(500).json({ error: 'Error sending email' });
    }
    res.json({ message: 'An e-mail has been sent to ' + email + ' with further instructions.' });
  });
});

app.post('/update-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await db.User.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: {
          [Op.gt]: new Date(), // Check if the token is still valid
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Password reset token is invalid or has expired." });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Save the new password and clear the reset token fields
    user.password = hashedPassword;
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    res.json({ message: "Your password has been updated successfully." });
  } catch (error) {
    console.error('Failed to update password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/stripe/account-status/:accountId', async (req, res) => {
  const { accountId } = req.params;
  try {
    const stripeAccount = await stripe.accounts.retrieve(accountId);
    res.json({
      details_submitted: stripeAccount.details_submitted,
      charges_enabled: stripeAccount.charges_enabled,
      payouts_enabled: stripeAccount.payouts_enabled
    });
  } catch (error) {
    console.error('Failed to retrieve Stripe account information:', error);
    if (error.code === 'account_invalid') {
      res.status(404).json({ error: 'Stripe account not found' });
    } else {
      res.status(500).json({ error: 'Failed to retrieve Stripe account information' });
    }
  }
});

// Middleware to verify if User is onboarded on Stripe Connect (Express)
const checkOnboardingComplete = async (req, res, next) => {
  const userId = req.user.userId;
  try {
    const user = await db.User.findByPk(userId);
    if (!user || !user.stripe_account_id) {
      return res.status(400).json({ message: 'Stripe account not found for user.' });
    }

    const onboardingComplete = await verifyStripeOnboarding(user.stripe_account_id);
    if (!onboardingComplete) {
      return res.status(403).json({ message: 'Please complete Stripe onboarding to proceed.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Endpoint to create a new car park
app.post('/api/create-carpark', authenticateToken, checkOnboardingComplete, async (req, res) => {
  const user = await db.User.findByPk(req.user.userId);

  // Check if the user has a connected Stripe account
  if (!user.stripe_account_id) {
    console.log(`User ${user.user_id} does not have a connected Stripe account`);
    return res.status(403).json({
      error: 'Stripe account not linked. Please complete the Stripe onboarding process.'
    });
  }

  // Check the status of the Stripe account
  const stripeAccountStatus = await stripe.accounts.retrieve(user.stripe_account_id);
  const isStripeAccountActive = stripeAccountStatus.details_submitted;

  if (!isStripeAccountActive) {
    console.log(`User ${user.user_id} has an inactive Stripe account`);
    return res.status(403).json({
      error: 'Stripe account is not fully activated. Please complete any required steps in your Stripe dashboard.'
    });
  }

  const { addressLine1, addressLine2, city, postcode, openTime, closeTime, accessInstructions, pricing, bays } = req.body;

  // Validate required fields
  if (!addressLine1 || !city || !postcode || !openTime || !closeTime || !pricing || !bays || bays.length === 0) {
    console.log('Missing required fields in car park creation request:', req.body);
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Parse openTime and closeTime as Date objects
  const parsedOpenTime = new Date(`2000-01-01T${openTime}:00Z`);
  const parsedCloseTime = new Date(`2000-01-01T${closeTime}:00Z`);

  // Construct full address from parts
  const fullAddress = `${addressLine1}, ${addressLine2 || ''}, ${city}, ${postcode}`;

  try {
    const response = await client.geocode({
      params: {
        address: fullAddress,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== 'OK') {
      if (response.data.status === 'ZERO_RESULTS') {
        return res.status(400).send('Invalid address. Please provide a valid address.');
      }
      throw new Error('Geocoding failed with status: ' + response.data.status);
    }

    const { lat, lng } = response.data.results[0].geometry.location;

    // Start transaction for database operations
    const result = await db.sequelize.transaction(async transaction => {
      const newCarPark = await db.CarPark.create({
        user_id: req.user.userId,
        addressLine1,
        addressLine2,
        city,
        postcode,
        openTime: parsedOpenTime,
        closeTime: parsedCloseTime,
        accessInstructions,
        pricing,
        latitude: lat,
        longitude: lng,
      }, { transaction });

      // Create each bay associated with this car park
      const bayPromises = bays.map(bay =>
        db.Bay.create({
          carpark_id: newCarPark.carpark_id,
          bay_number: bay.bay_number,
          vehicleSize: bay.vehicleSize,
          hasEVCharging: bay.hasEVCharging,
          disabled: bay.disabled,
          description: bay.description,
        }, { transaction })
      );

      await Promise.all(bayPromises);

      return newCarPark;
    });

    res.status(201).json({ message: "Car park created successfully", carparkId: result.carpark_id });
  } catch (error) {
    console.error('Error creating car park:', error);
    res.status(500).json({ error: 'An error occurred while creating the car park.' });
  }
});


// Endpoint for user to mark a soft delete for a car park
app.delete('/api/carparks/:carparkId', authenticateToken, async (req, res) => {
  const { carparkId } = req.params;

  try {
    const carPark = await db.CarPark.findOne({
      where: {
        carpark_id: carparkId,
        user_id: req.user.userId,
        deletedAt: null  // Ensure the car park has not already been marked as deleted
      }
    });

    if (!carPark) {
      console.log(`User ${req.user.userId} attempted to delete a non-existent or unauthorized carpark with ID ${carparkId}`);
      return res.status(404).json({ error: 'Car park not found or you do not have permission to delete it' });
    }

    // Mark the carpark as deleted instead of destroying it
    await carPark.update({ deletedAt: new Date() });
    console.log(`Carpark with ID ${carparkId} marked as deleted successfully by user ${req.user.userId}`);

    res.json({ message: 'Car park marked as deleted successfully' });
  } catch (error) {
    console.error('Error deleting car park:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin endpoint for user to mark a soft delete for a car park
app.delete('/api/admin/carparks/:carparkId', authenticateToken, verifyRole(['admin']), async (req, res) => {
  const { carparkId } = req.params;

  try {
    const carPark = await db.CarPark.findOne({
      where: {
        carpark_id: carparkId,
        deletedAt: null  // Ensure the car park has not already been marked as deleted
      }
    });

    if (!carPark) {
      console.log(`Admin user ${req.user.userId} attempted to delete a non-existent or already deleted carpark with ID ${carparkId}`);
      return res.status(404).json({ error: 'Car park not found or already deleted' });
    }

    // Mark the carpark as deleted instead of destroying it
    await carPark.update({ deletedAt: new Date() });
    console.log(`Carpark with ID ${carparkId} marked as deleted successfully by admin user ${req.user.userId}`);

    res.json({ message: 'Car park marked as deleted successfully by admin' });
  } catch (error) {
    console.error('Error deleting car park by admin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Force delete a carpark (admin only)
app.delete('/api/admin/carparks/:carparkId/force', authenticateToken, verifyRole(['admin']), async (req, res) => {
  const { carparkId } = req.params;

  try {
    const carPark = await db.CarPark.findOne({
      where: { carpark_id: carparkId }
    });

    if (!carPark) {
      return res.status(404).json({ error: 'Car park not found' });
    }

    // Delete associated bays and logs
    await db.Bay.destroy({ where: { carpark_id: carparkId } });
    await db.CarParkLog.destroy({ where: { carpark_id: carparkId } });

    // Force delete the car park
    await carPark.destroy();

    res.json({ message: 'Car park deleted permanently' });
  } catch (error) {
    console.error('Error deleting car park permanently:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Schedule to delete marked car parks and users once a day at midnight
cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000); // Subtract 30 days in milliseconds

  console.log(`Current time: ${now.toISOString()}`);
  console.log(`Thirty days ago: ${thirtyDaysAgo.toISOString()}`);

  try {
    const carParksToDelete = await db.CarPark.findAll({
      where: {
        deletedAt: {
          [Op.ne]: null,          // Ensure deletedAt is not null
          [Op.lte]: thirtyDaysAgo // Check if the deletedAt time is less than or equal to thirty days ago
        }
      },
      include: [
        { model: db.Bay, as: 'bays' },
        { model: db.CarParkLog, as: 'logs' }
      ]
    });

    for (const carPark of carParksToDelete) {
      // Delete associated bays
      await db.Bay.destroy({ where: { carpark_id: carPark.carpark_id } });

      // Delete associated logs
      await db.CarParkLog.destroy({ where: { carpark_id: carPark.carpark_id } });

      // Delete the car park
      await carPark.destroy();
    }

    console.log(`Automatically deleted ${carParksToDelete.length} car parks that were marked for deletion over thirty days ago.`);
  } catch (error) {
    console.error('Failed to automatically delete old car parks:', error);
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const deletedUsers = await db.User.destroy({
      where: {
        deletedAt: {
          [Op.ne]: null,
          [Op.lte]: thirtyDaysAgo
        }
      }
    });

    console.log(`Automatically deleted ${deletedUsers} users that were marked for deletion over thirty days ago.`);
  } catch (error) {
    console.error('Failed to automatically delete old users:', error);
  }
});


// Admin endpoint to force delete a user immediately
app.delete('/api/admin/users/:userId/force', authenticateToken, verifyRole(['admin']), async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await db.User.findByPk(userId, {
      include: [
        { model: db.CarPark, as: 'carParks' },
        { model: db.CarParkLog, as: 'logs' },
        { model: db.Payment, as: 'payments' },
        { model: db.Refund, as: 'createdRefunds' },
        { model: db.Refund, as: 'updatedRefunds' }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Using transactions to ensure data integrity
    await db.sequelize.transaction(async (transaction) => {
      // Delete related car parks and their dependencies
      for (const carPark of user.carParks) {
        await db.Bay.destroy({ where: { carpark_id: carPark.carpark_id }, transaction });
        await db.CarParkLog.destroy({ where: { carpark_id: carPark.carpark_id }, transaction });
        await carPark.destroy({ transaction });
      }

      // Delete user logs, payments, and refunds
      await db.CarParkLog.destroy({ where: { user_id: userId }, transaction });
      await db.Payment.destroy({ where: { userId: userId }, transaction });
      await db.Refund.destroy({ where: { createdBy: userId }, transaction });
      await db.Refund.destroy({ where: { updatedBy: userId }, transaction });

      // Finally, delete the user
      await user.destroy({ transaction });
    });

    res.json({ message: `Successfully deleted user with ID ${userId}` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});







// Endpoint to edit a car park (for users)
app.put('/api/carparks/:carparkId', authenticateToken, async (req, res) => {
  const { carparkId } = req.params;
  const { addressLine1, addressLine2, city, postcode, openTime, closeTime, accessInstructions, pricing, bays } = req.body;

  try {
    const carPark = await db.CarPark.findOne({
      where: { carpark_id: carparkId, user_id: req.user.userId },
      include: [{ model: db.Bay, as: 'bays' }]
    });

    if (!carPark) {
      console.log(`Car park with ID ${carparkId} not found or user ${req.user.userId} is not authorized`);
      return res.status(404).send('Car park not found or user is not authorized');
    }

    // Parse openTime and closeTime as Date objects
    const parsedOpenTime = new Date(`2000-01-01T${openTime}:00Z`);
    const parsedCloseTime = new Date(`2000-01-01T${closeTime}:00Z`);

    // Update the car park details
    carPark.addressLine1 = addressLine1;
    carPark.addressLine2 = addressLine2;
    carPark.city = city;
    carPark.postcode = postcode;
    carPark.openTime = parsedOpenTime;
    carPark.closeTime = parsedCloseTime;
    carPark.accessInstructions = accessInstructions;
    carPark.pricing = pricing;

    // Geocode the updated address
    const fullAddress = `${addressLine1}, ${addressLine2 || ''}, ${city}, ${postcode}`;
    const response = await client.geocode({
      params: {
        address: fullAddress,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status === 'OK') {
      const { lat, lng } = response.data.results[0].geometry.location;
      carPark.latitude = lat;
      carPark.longitude = lng;
      console.log(`Geocoding successful for carpark with ID ${carparkId}. Latitude: ${lat}, Longitude: ${lng}`);
    } else {
      console.log(`Geocoding failed for carpark with ID ${carparkId}. Status: ${response.data.status}`);
    }

    await carPark.save();
    console.log(`Carpark with ID ${carparkId} updated successfully by user ${req.user.userId}`);

    // Delete bays and associated logs
    const bayIds = carPark.bays.map(bay => bay.bay_id);
    await db.CarParkLog.destroy({ where: { bay_id: bayIds } });
    await db.Bay.destroy({ where: { carpark_id: carparkId } });
    console.log(`Bays and associated logs for carpark with ID ${carparkId} deleted successfully`);

    // Create new bays
    const bayPromises = bays.map(bay =>
      db.Bay.create({
        carpark_id: carparkId,
        bay_number: bay.bay_number,
        vehicleSize: bay.vehicleSize,
        hasEVCharging: bay.hasEVCharging,
        disabled: bay.disabled,
        description: bay.description,
      })
    );
    await Promise.all(bayPromises);
    console.log(`New bays created for carpark with ID ${carparkId}`);

    res.json({ message: 'Car park updated successfully' });
  } catch (error) {
    console.error('Error updating car park:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to edit a car park (for admins)
app.put('/api/admin/carparks/:carparkId', authenticateToken, verifyRole(['admin']), async (req, res) => {
  const { carparkId } = req.params;
  const { addressLine1, addressLine2, city, postcode, openTime, closeTime, accessInstructions, pricing, bays } = req.body;

  try {
    const carPark = await db.CarPark.findOne({
      where: { carpark_id: carparkId },
      include: [{ model: db.Bay, as: 'bays' }]
    });

    if (!carPark) {
      console.log(`Car park with ID ${carparkId} not found`);
      return res.status(404).send('Car park not found');
    }

    // Parse openTime and closeTime as Date objects
    const parsedOpenTime = new Date(`2000-01-01T${openTime}:00Z`);
    const parsedCloseTime = new Date(`2000-01-01T${closeTime}:00Z`);

    // Update the car park details
    carPark.addressLine1 = addressLine1;
    carPark.addressLine2 = addressLine2;
    carPark.city = city;
    carPark.postcode = postcode;
    carPark.openTime = parsedOpenTime;
    carPark.closeTime = parsedCloseTime;
    carPark.accessInstructions = accessInstructions;
    carPark.pricing = pricing;

    // Geocode the updated address
    const fullAddress = `${addressLine1}, ${addressLine2 || ''}, ${city}, ${postcode}`;
    const response = await client.geocode({
      params: {
        address: fullAddress,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status === 'OK') {
      const { lat, lng } = response.data.results[0].geometry.location;
      carPark.latitude = lat;
      carPark.longitude = lng;
      console.log(`Geocoding successful for carpark with ID ${carparkId}. Latitude: ${lat}, Longitude: ${lng}`);
    } else {
      console.log(`Geocoding failed for carpark with ID ${carparkId}. Status: ${response.data.status}`);
    }

    await carPark.save();
    console.log(`Carpark with ID ${carparkId} updated successfully by admin ${req.user.userId}`);

    // Delete bays and associated logs
    const bayIds = carPark.bays.map(bay => bay.bay_id);
    await db.CarParkLog.destroy({ where: { bay_id: bayIds } });
    await db.Bay.destroy({ where: { carpark_id: carparkId } });
    console.log(`Bays and associated logs for carpark with ID ${carparkId} deleted successfully`);

    // Create new bays
    const bayPromises = bays.map(bay =>
      db.Bay.create({
        carpark_id: carparkId,
        bay_number: bay.bay_number,
        vehicleSize: bay.vehicleSize,
        hasEVCharging: bay.hasEVCharging,
        disabled: bay.disabled,
        description: bay.description,
      })
    );
    await Promise.all(bayPromises);
    console.log(`New bays created for carpark with ID ${carparkId}`);

    res.json({ message: 'Car park updated successfully' });
  } catch (error) {
    console.error('Error updating car park:', error);
    res.status(500).send('Internal Server Error');
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

// Admin endpoint get all carparks for admin with optional address filtering
app.get('/api/admin/carparks', authenticateToken, verifyRole(['admin']), async (req, res) => {
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
  const { carparkId } = req.params;
  console.log(`Fetching bays for car park ID: ${carparkId}`);

  try {
    const bays = await db.Bay.findAll({
      where: { carpark_id: carparkId }
    });
    console.log(`Found ${bays.length} bays`);

    if (bays.length > 0) {
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
  const { bay_id, carpark_id, startTime, endTime, cost, stripeToken } = req.body;
  const user_id = req.user.userId;

  if (!stripeToken) {
    return res.status(400).json({ error: 'Stripe token is required.' });
  }
  if (typeof cost !== 'number' || cost <= 0) {
    return res.status(400).json({ error: 'Invalid cost provided.' });
  }

  const transaction = await db.sequelize.transaction();

  try {
    const isAvailable = await checkBayAvailability(bay_id, startTime, endTime, transaction);
    if (!isAvailable) {
      await transaction.rollback();
      return res.status(400).json({ error: 'The requested bay is not available or already booked.' });
    }

    const carpark = await db.CarPark.findOne({
      where: { carpark_id },
      include: [{ model: db.User, as: 'User' }]
    });

    if (!carpark || !carpark.User || !carpark.User.stripe_account_id) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Carpark, owner, or connected account not found.' });
    }

    const totalCost = cost + 0.30; // Including a fixed processing fee for example
    const charge = await stripe.charges.create({
      amount: Math.round(totalCost * 100),
      currency: 'gbp',
      source: stripeToken,
      description: `Charge for parking at bay ${bay_id} in carpark ${carpark_id}`,
      application_fee_amount: Math.round(cost * 0.10 * 100), // 10% platform fee
    }, {
      stripeAccount: carpark.User.stripe_account_id
    });

    if (!charge.paid) {
      await transaction.rollback();
      return res.status(402).json({ error: 'Payment failed.' });
    }

    const payment = await db.Payment.create({
      stripePaymentId: charge.id,
      amount: cost,
      platformFee: cost * 0.10,
      processingFee: 0.30,
      paymentStatus: 'completed',
      receiptUrl: charge.receipt_url,
      date_paid: new Date(),
      userId: user_id
    }, { transaction });

    const booking = await db.CarParkLog.create({
      bay_id,
      carpark_id,
      user_id,
      payment_id: payment.payment_id,
      startTime,
      endTime,
      cost,
    }, { transaction });

    await transaction.commit();
    res.json({
      message: "Booking and payment successful",
      bookingId: booking.log_id,
      paymentId: payment.payment_id,
      chargeId: charge.id
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Booking or payment error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to check bay availability within a transaction
async function checkBayAvailability(bayId, startTime, endTime, transaction) {
  const overlappingBookings = await db.CarParkLog.count({
    where: {
      bay_id: bayId,
      [Op.or]: [
        {
          [Op.and]: [
            { startTime: { [Op.lt]: endTime } },
            { endTime: { [Op.gt]: startTime } }
          ]
        }
      ],
    },
    transaction
  });
  return overlappingBookings === 0; // true if no overlapping bookings
}

// Schedule a task to run every minute (FOR TESTING/DEVELOPMENT THIS IS ONCE A DAY)
cron.schedule('0 0 * * *', async () => {
  console.log('Running a task every minute to check for expired bookings and update statuses');

  const now = new Date();
  const transaction = await db.sequelize.transaction();

  try {
    // Update bookings to 'Completed' that are past their end time and not cancelled
    const [updated] = await db.CarParkLog.update(
      { status: 'completed' },
      {
        where: {
          endTime: {
            [db.Sequelize.Op.lt]: now
          },
          status: {
            [db.Sequelize.Op.ne]: 'cancelled'
          }
        },
        transaction: transaction
      }
    );
    console.log(`${updated} bookings updated to 'completed'`);
    ''
    // Check and update the bay status based on the current active bookings
    const baysToUpdate = await db.Bay.findAll({
      include: [{
        model: db.CarParkLog,
        as: 'logs',
        required: true,  // Only include bays that have associated bookings
        where: {
          endTime: { [db.Sequelize.Op.gt]: now },  // Find bays with ongoing bookings
        }
      }]
    });

    // Calculate and set bay availability
    for (const bay of baysToUpdate) {
      const activeBookingsCount = await db.CarParkLog.count({
        where: {
          bay_id: bay.bay_id,
          endTime: { [db.Sequelize.Op.gt]: now }
        }
      });

      // Update bay availability based on active bookings
      bay.isAvailable = activeBookingsCount === 0;
      await bay.save({ transaction });
    }

    // Commit the transaction if all updates were successful
    await transaction.commit();
    console.log('Transaction committed successfully.');
  } catch (error) {
    // Rollback transaction if there are any errors
    await transaction.rollback();
    console.error('Error during the scheduled task:', error);
  }
});

// Check for bay availability
app.get('/api/bays/:bayId/availability', async (req, res) => {
  const { bayId } = req.params;
  const { startTime, endTime } = req.query;

  if (!startTime || !endTime || new Date(startTime).toString() === "Invalid Date" || new Date(endTime).toString() === "Invalid Date") {
    return res.status(400).send('Invalid start time or end time. Please provide valid ISO 8601 date strings.');
  }

  try {
    const overlappingBookings = await db.CarParkLog.count({
      where: {
        bay_id: bayId,
        [Op.or]: [
          {
            [Op.and]: [
              { startTime: { [Op.lt]: endTime } },
              { endTime: { [Op.gt]: startTime } }
            ]
          }
        ],
      },
    });

    console.log(`Overlapping bookings for bay ${bayId}: ${overlappingBookings}`);

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
  const { phone, address, first_name, last_name, email, DOB, car_registration, blueBadge } = req.body;

  // Basic validation
  if (!first_name || !last_name || !email || !phone || !DOB) {
    return res.status(400).json({ message: 'All fields except password must be filled.' });
  }

  const updatedFields = {
    phone,
    address,
    first_name,
    last_name,
    email,
    DOB,
    car_registration,
    blueBadge
  };

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

// Admin endpoint to update any user's details
app.put('/api/admin/users/:userId', authenticateToken, verifyRole(['admin']), async (req, res) => {
  const { userId } = req.params;
  const { phone, address, first_name, last_name, email, DOB, car_registration, blueBadge } = req.body;

  // Basic validation
  if (!first_name || !last_name || !email || !phone || !DOB) {
    return res.status(400).json({ message: 'All fields except password must be filled.' });
  }

  const updatedFields = {
    phone,
    address,
    first_name,
    last_name,
    email,
    DOB,
    car_registration,
    blueBadge
  };

  console.log('Admin attempting to update user:', userId, updatedFields);

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
      res.json({ message: 'User updated successfully by admin' });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    if (transaction) await transaction.rollback(); // Rollback transaction on error
    console.error('Failed to update user by admin:', error);
    res.status(500).send(error.message);
  }
});

// Fetch a specific user's details (admin only)
app.get('/api/admin/users/:userId', authenticateToken, verifyRole(['admin']), async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await db.User.findByPk(userId);
    if (!user) {
      res.status(404).send('User not found');
    } else {
      res.json(user);
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to fetch user details
app.get('/user-details', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userDetails = await db.User.findByPk(userId);
    if (userDetails) {
      console.log("Fetched user details:", userDetails); // Log user details to help with debugging
      res.json(userDetails);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Admin endpoint to fetch all users
app.get('/api/admin/users', authenticateToken, verifyRole(['admin']), async (req, res) => {
  try {
    const users = await db.User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Admin endpoint to fetch a specific user by ID
app.get('/api/admin/users/:userId', authenticateToken, verifyRole(['admin']), async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json(user);
  } catch (error) {
    console.error('Failed to fetch user details:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Admin endpoint to soft delete a user
app.delete('/api/admin/users/:userId', authenticateToken, verifyRole(['admin']), async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await db.User.findOne({
      where: {
        user_id: userId,
        deletedAt: null  // Ensure the user has not already been marked as deleted
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found or already deleted' });
    }

    // Mark the user as deleted instead of destroying it
    await user.update({ deletedAt: new Date() });

    res.json({ message: 'User marked as deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin endpoint to force delete a user immediately
app.delete('/api/admin/users/:userId/force', authenticateToken, verifyRole(['admin']), async (req, res) => {
  const { userId } = req.params;

  try {
    const deleted = await db.User.destroy({
      where: { user_id: userId }
    });

    if (deleted) {
      res.json({ message: `Successfully deleted user with ID ${userId}` });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Fetch booking logs for a user
app.get('/api/user/bookings', authenticateToken, async (req, res) => {
  const user_id = req.user.userId;
  try {
    const now = new Date();
    const bookings = await db.CarParkLog.findAll({
      where: { user_id },
      include: [{ model: db.Bay, as: 'bay' }, { model: db.CarPark, as: 'carPark' }],
      order: [['startTime', 'DESC']] // Newest bookings first
    });

    const formattedBookings = {
      current: bookings.filter(b => new Date(b.startTime) <= now && new Date(b.endTime) >= now),
      upcoming: bookings.filter(b => new Date(b.startTime) > now),
      past: bookings.filter(b => new Date(b.endTime) < now)
    };

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching booking logs:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Cancel booking endpoint
app.put('/api/cancel-booking/:bookingId', authenticateToken, async (req, res) => {
  const { bookingId } = req.params;
  console.log(`Received request to cancel booking with ID: ${bookingId}`);
  try {
    const [updatedCount, updatedBookings] = await db.CarParkLog.update(
      { status: 'cancelled', cancelledAt: new Date() },
      { where: { log_id: bookingId }, returning: true }
    );
    if (updatedCount > 0) {
      console.log('Booking cancelled successfully:', updatedBookings[0]);
      res.json({ message: "Booking cancelled successfully", booking: updatedBookings[0] });
    } else {
      res.status(404).send('Booking not found');
    }
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch all payment records for a logged-in user
app.get('/api/user/payments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const payments = await db.Payment.findAll({
      where: { userId: userId },
      include: [
        { model: db.CarParkLog, as: 'log' },
        { model: db.Refund, as: 'refund' }
      ]
    });

    const serializedPayments = payments.map(payment => ({
      ...payment.toJSON(),
      amount: parseFloat(payment.amount),
      log: payment.log,
      refund: payment.refund
    }));

    res.json(serializedPayments);
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

// Fetch a single booking by ID for a user
app.get('/api/user/bookings/:log_id', authenticateToken, async (req, res) => {
  const { log_id } = req.params;
  const user_id = req.user.userId;
  try {
    const booking = await db.CarParkLog.findOne({
      where: { log_id: log_id, user_id: user_id },
      include: [{ model: db.Bay, as: 'bay' }, { model: db.CarPark, as: 'carPark' }]
    });

    if (!booking) {
      res.status(404).send('Booking not found');
      return;
    }

    // Parse the cost as a float before sending it to the client
    booking.cost = parseFloat(booking.cost);

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to fetch a specific payment by ID
app.get('/api/payments/:paymentId', authenticateToken, async (req, res) => {
  const { paymentId } = req.params;
  const { include } = req.query;

  try {
    const options = {
      where: { payment_id: paymentId },
      include: [
        { model: db.User, as: 'user' },
        { model: db.CarParkLog, as: 'log' }
      ]
    };

    if (include === 'refund') {
      options.include.push({ model: db.Refund, as: 'refund' });
    }

    const payment = await db.Payment.findOne(options);

    if (!payment) {
      return res.status(404).send('Payment not found');
    }

    // Check if the authenticated user is the owner of the payment or an admin
    if (req.user.userId !== payment.userId && req.user.role !== 'admin') {
      return res.status(403).send('Forbidden: You do not have permission to access this payment');
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).send('Failed to fetch payment');
  }
});

app.post('/api/request-refund', authenticateToken, async (req, res) => {
  const { paymentId, reason, receiptUrl } = req.body;
  const userId = req.user.userId;

  try {
    const payment = await db.Payment.findOne({
      where: { payment_id: paymentId, userId: userId },
      include: [{ model: db.CarParkLog, as: 'log' }]
    });

    if (!payment || !payment.log) {
      console.log('Payment or associated booking log not found');
      return res.status(404).json({ message: 'Payment or associated booking log not found' });
    }

    if (payment.paymentStatus === 'refunded' || payment.paymentStatus === 'refunding') {
      return res.status(400).json({ message: 'Refund already processed or in progress' });
    }

    const currentTime = new Date();
    const startTime = new Date(payment.log.startTime);
    const hoursDifference = (startTime - currentTime) / (1000 * 60 * 60);

    if (hoursDifference >= 24) {
      const refund = await processAutomaticRefund(payment, userId, reason);
      res.json({ message: 'Refund processed automatically', refundId: refund.refund_id });
    } else {
      const refund = await db.Refund.create({
        payment_id: paymentId,
        amount: payment.amount,
        status: 'requested',
        reason: reason,
        log_id: payment.log.log_id,
        createdBy: userId,
        updatedBy: userId,
      });

      console.log('Refund request created:', refund);
      res.json({ message: 'Refund request submitted for review', refundId: refund.refund_id });
    }
  } catch (error) {
    console.error('Failed to request refund:', error);
    res.status(500).send({ message: error.message });
  }
});

async function processAutomaticRefund(payment, userId, reason) {
  try {
    const carpark = await db.CarPark.findOne({
      where: { carpark_id: payment.log.carpark_id },
      include: [{ model: db.User, as: 'User' }]
    });

    if (!carpark || !carpark.User || !carpark.User.stripe_account_id) {
      throw new Error('Carpark, owner, or connected account not found.');
    }

    // Calculate the total refund amount including the processing fee
    const totalRefundAmount = parseFloat(payment.amount) + parseFloat(payment.processingFee);
    console.log('Total refund amount:', totalRefundAmount);

    if (isNaN(totalRefundAmount)) {
      throw new Error('Invalid total refund amount');
    }

    const refundAmountInCents = Math.round(totalRefundAmount * 100);
    console.log('Refund amount in cents:', refundAmountInCents);

    const stripeRefund = await stripe.refunds.create({
      charge: payment.stripePaymentId,
      amount: refundAmountInCents,
    }, {
      stripeAccount: carpark.User.stripe_account_id,
    });

    const refund = await db.Refund.create({
      payment_id: payment.payment_id,
      amount: totalRefundAmount,
      status: 'approved',
      reason: reason,
      decision: 'Automatic refund for cancellation more than 24 hours before start time',
      log_id: payment.log.log_id,
      stripeRefundId: stripeRefund.id,
      receiptUrl: stripeRefund.receipt_url, // Use the receipt URL from the Stripe refund object
      processedAt: new Date(),
      createdBy: userId,
      updatedBy: userId,
    });

    await db.Payment.update(
      { paymentStatus: 'refunded' },
      { where: { payment_id: payment.payment_id } }
    );
    await db.CarParkLog.update(
      { status: 'refunded' },
      { where: { log_id: payment.log.log_id } }
    );

    return refund;
  } catch (error) {
    console.error('Error processing automatic refund:', error);
    throw error;
  }
}

// Admin route to fetch all refunds with optional filters and admin verification
app.get('/api/refunds', authenticateToken, verifyRole(['admin']), async (req, res) => {
  const { status, paymentId, userId, startDate, endDate } = req.query;

  try {
    const whereClause = {
      ...(status && { status }),
      ...(paymentId && { payment_id: paymentId }),
      ...(userId && { '$payment.user_id$': userId }),
      ...(startDate && endDate && { createdAt: { [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)] } })
    };

    const refunds = await db.Refund.findAll({
      where: whereClause,
      include: [
        { model: db.Payment, as: 'payment', include: [{ model: db.User, as: 'user' }] }
      ]
    });

    res.json(refunds);
  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).send('Failed to fetch refunds');
  }
});

// Helper function to update the refund record in the database
async function updateRefundRecord(refund, stripeRefund, decision, userId) {
  await db.sequelize.transaction(async (transaction) => {
    const updateData = {
      status: 'approved',
      decision: decision,
      processedAt: new Date(),
      updatedBy: userId,
      stripeRefundId: stripeRefund.id,
      receiptUrl: stripeRefund.receipt_url
    };

    await refund.update(updateData, { transaction });

    await db.Payment.update({ paymentStatus: 'refunded' }, {
      where: { payment_id: refund.payment_id },
      transaction
    });

    if (refund.payment.log) {
      await db.CarParkLog.update({ status: 'refunded' }, {
        where: { log_id: refund.payment.log.log_id },
        transaction
      });
    }
  });
}

// Admin function for approving refunds
app.post('/api/refunds/:refundId/approve', authenticateToken, verifyRole(['admin']), async (req, res) => {
  const { refundId } = req.params;
  const { decision } = req.body;

  if (!decision) {
    return res.status(400).send('Decision for approval is required');
  }

  try {
    const refund = await db.Refund.findOne({
      where: { refund_id: refundId, status: ['requested', 'denied'] },
      include: [{
        model: db.Payment,
        as: 'payment',
        include: [{
          model: db.CarParkLog,
          as: 'log',
          include: [{
            model: db.CarPark,
            as: 'carPark',
            include: [{
              model: db.User,
              as: 'User'
            }]
          }]
        }]
      }]
    });

    console.log('Refund:', refund);

    if (!refund) {
      return res.status(404).send('Refund request not found or already processed');
    }

    // Convert pounds/dollars to cents for the API call
    if (refund.amount == null || refund.payment.processingFee == null) {
      console.error('Invalid data: Amount or processing fee is null');
      return res.status(500).send('Internal error with refund data');
    }

    const refundAmount = Math.round((Number(refund.amount) + Number(refund.payment.processingFee)) * 100);
    console.log(`Refund amount in cents calculated: ${refundAmount}`);

    if (isNaN(refundAmount)) {
      return res.status(400).send('Invalid amount for refund');
    }

    const stripeRefund = await stripe.refunds.create({
      charge: refund.payment.stripePaymentId,
      amount: refundAmount,
    }, {
      stripeAccount: refund.payment.log.carPark.User.stripe_account_id,
    });

    await updateRefundRecord(refund, stripeRefund, decision, req.user.userId);
    res.json({ message: 'Refund approved successfully', refund });
  } catch (error) {
    console.error('Failed to approve refund:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Admin function for denying refunds
app.post('/api/refunds/:refundId/deny', authenticateToken, verifyRole(['admin']), async (req, res) => {
  const { refundId } = req.params;
  const { decision } = req.body;

  if (!decision) {
    return res.status(400).send('Decision for denial is required');
  }

  try {
    const refund = await db.Refund.findOne({
      where: { refund_id: refundId }
    });

    if (!refund) {
      return res.status(404).send('Refund request not found');
    } else if (refund.status === 'denied') {
      return res.status(409).send('Refund is already denied');  // Using HTTP status code 409 Conflict for logical conflict
    }

    await refund.update({
      status: 'denied',
      decision: decision,
      processedAt: new Date(),
      updatedBy: req.user.userId
    });

    res.json({ message: 'Refund denied successfully', refund });
  } catch (error) {
    console.error('Failed to deny refund:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Function to fetch a specific refund by ID (admin and user)
app.get('/api/refunds/:refundId', authenticateToken, async (req, res) => {
  const { refundId } = req.params;

  try {
    const refund = await db.Refund.findOne({
      where: { refund_id: refundId },
      include: [
        { model: db.Payment, as: 'payment', include: [{ model: db.User, as: 'user' }] }
      ]
    });

    if (!refund) return res.status(404).send('Refund not found');

    // Check if the user is an admin or the refund belongs to the user
    if (req.user.role !== 'admin' && refund.payment.user.user_id !== req.user.userId) {
      return res.status(403).send('Forbidden');
    }

    res.json(refund);
  } catch (error) {
    console.error('Error fetching refund:', error);
    res.status(500).send('Failed to fetch refund');
  }
});

// User function to resubmit a refund request
app.post('/api/refunds/:refundId/resubmit', authenticateToken, async (req, res) => {
  const { refundId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).send('Reason is required for resubmitting a refund request');
  }

  try {
    const refund = await db.Refund.findOne({
      where: { refund_id: refundId, status: 'denied' }
    });

    if (!refund) {
      return res.status(404).send('Refund request not found or not in denied status');
    }

    await refund.update({
      status: 'requested',
      reason: reason,
      updatedBy: req.user.userId
    });

    console.log('Refund request resubmitted successfully:', refund);
    res.json({ message: 'Refund request resubmitted successfully', refund });
  } catch (error) {
    console.error('Failed to resubmit refund:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to fetch a refund by Payment ID
app.get('/api/refunds/payment/:paymentId', authenticateToken, async (req, res) => {
  const { paymentId } = req.params;
  try {
    const refund = await db.Refund.findOne({
      where: { payment_id: paymentId },
      include: [{ model: db.Payment, as: 'payment' }]
    });
    if (!refund) {
      return res.status(404).send('Refund not found for the given payment ID');
    }
    res.json(refund);
  } catch (error) {
    console.error('Error fetching refund by payment ID:', error);
    res.status(500).send('Server error');
  }
});

// Endpoint to create Stripe dashboard link
app.get('/api/stripe/dashboard-link', authenticateToken, async (req, res) => {
  try {
    console.log('Creating Stripe dashboard link for user:', req.user.userId);
    const loginLink = await stripe.accounts.createLoginLink(req.user.stripeAccountId);
    console.log('Stripe dashboard link created successfully:', loginLink.url);
    res.json({ url: loginLink.url });
  } catch (error) {
    console.error('Failed to create Stripe dashboard link:', error);
    res.status(500).send('Failed to create Stripe dashboard link');
  }
});

app.post('/api/check-new-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await db.User.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Password reset token is invalid or has expired." });
    }

    const match = await bcrypt.compare(newPassword, user.password);
    if (match) {
      return res.status(409).json({ error: 'Password matches current password' });
    }

    res.status(200).json({ message: 'Password is acceptable' });
  } catch (error) {
    console.error('Error checking new password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get Stripe balance
app.get('/api/stripe/balance', authenticateToken, async (req, res) => {
  if (!req.user.stripeAccountId) {
    console.error('No Stripe account ID found for user:', req.user.userId);
    return res.status(400).json({ error: 'No Stripe account ID found' });
  }

  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: req.user.stripeAccountId
    });

    console.log('Stripe balance retrieved:', balance);

    // Optionally calculate total earnings
    const totalEarnings = balance.available.reduce((acc, curr) => acc + curr.amount, 0) +
      balance.pending.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({ available: balance.available, pending: balance.pending, totalEarnings });
  } catch (error) {
    console.error('Failed to retrieve balance:', error);
    res.status(500).send('Failed to retrieve Stripe balance');
  }
});

// Endpoint to fetch detailed transactions for a Stripe account
app.get('/api/user/transactions/:accountId', authenticateToken, async (req, res) => {
  const { accountId } = req.params;
  try {
    const transactions = await stripe.balanceTransactions.list({
      limit: 100,
      expand: ['data.fee_details'], // Expands the fee details in the response
      stripeAccount: accountId,
    });
    res.json(transactions);
  } catch (error) {
    console.error('Failed to retrieve transactions:', error);
    res.status(500).send('Failed to retrieve transactions');
  }
});

// Add this endpoint to fetch user's car parks
app.get('/api/user/carparks', authenticateToken, async (req, res) => {
  try {
    const carParks = await db.CarPark.findAll({
      where: {
        user_id: req.user.userId,
        deletedAt: null, // Ensure we are not fetching soft-deleted car parks
      },
    });
    res.json(carParks);
  } catch (error) {
    console.error('Failed to fetch user car parks:', error);
    res.status(500).send('Internal Server Error');
  }
});