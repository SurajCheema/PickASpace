const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./models');
const PORT = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const { Op, or } = require('sequelize');

require('dotenv').config();

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
      DOB,
      role = 'user' // Default role is 'user'
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
      phone,
      DOB,
      role
    });

    res.json({ message: "User created successfully", userId: newUser.user_id, role: newUser.role });
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

// Create a new car park
app.post('/api/create-carpark', authenticateToken, async (req, res) => {
  console.log(req.user); // Log to confirm the structure

  // Extracted from the token by the middleware
  const user_id = req.user.userId;

  const transaction = await db.sequelize.transaction();
  try {
    const { addressLine1, addressLine2, city, postcode, openTime, closeTime, accessInstructions, pricing, bays } = req.body;

    const geocoder = new google.maps.Geocoder();
    const address = `${addressLine1}, ${addressLine2 || ''}, ${city}, ${postcode}`;

    try {
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK') {
            resolve(results[0].geometry.location);
          } else {
            reject(new Error(`Geocode was not successful for the following reason: ${status}`));
          }
        });
      });

      const { lat, lng } = response;

      const newCarPark = await db.CarPark.create({
        user_id,
        addressLine1,
        addressLine2,
        city,
        postcode,
        openTime,
        closeTime,
        accessInstructions,
        pricing,
        latitude: lat,
        longitude: lng,
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
      console.error('Error geocoding address:', error);
      await transaction.rollback();
      res.status(500).send('Error creating car park');
    }
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
  const { bay_id, carpark_id, startTime, endTime, cost, stripeToken } = req.body;
  const user_id = req.user.userId;  // Assuming authenticateToken middleware correctly attaches user to request

  // Validate inputs
  if (!stripeToken) {
    return res.status(400).json({ error: 'Stripe token is required.' });
  }
  if (typeof cost !== 'number' || cost <= 0) {
    return res.status(400).json({ error: 'Invalid cost provided.' });
  }

  const transaction = await db.sequelize.transaction();

  try {
    // Check bay availability including overlap check
    const isAvailable = await checkBayAvailability(bay_id, startTime, endTime, transaction);
    if (!isAvailable) {
      await transaction.rollback();
      return res.status(400).json({ error: 'The requested bay is not available or already booked.' });
    }

    // Create Stripe charge
    const charge = await stripe.charges.create({
      amount: cost,
      currency: 'gbp',
      source: stripeToken,
      description: `Charge for parking at bay ${bay_id} in carpark ${carpark_id}`
    });

    // Verify if the charge was successful
    if (!charge.paid) {
      await transaction.rollback();
      return res.status(402).json({ error: 'Payment failed.' });
    }

    // Create a payment record
    const payment = await db.Payment.create({
      stripePaymentId: charge.id,
      amount: cost / 100, // Convert cost from pence to pounds
      paymentStatus: 'completed',
      receiptUrl: charge.receipt_url,
      date_paid: new Date(),
      userId: user_id
    }, { transaction });

    // Record the booking
    const booking = await db.CarParkLog.create({
      bay_id,
      carpark_id,
      user_id,
      payment_id: payment.payment_id,
      startTime,
      endTime,
      cost: cost / 100,
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

// Schedule a task to run every minute
cron.schedule('* * * * *', async () => {
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

  const { phone, address, first_name, last_name, email, DOB, car_registration, password } = req.body;

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
  const { paymentId, reason } = req.body;
  const userId = req.user.userId;

  try {
    const payment = await db.Payment.findOne({
      where: {
        payment_id: paymentId,
        userId: userId
      },
      include: [{ model: db.CarParkLog, as: 'log' }]
    });

    if (!payment || !payment.log) {
      return res.status(404).json({ message: 'Payment or associated booking not found' });
    }

    if (payment.paymentStatus === 'refunded' || payment.paymentStatus === 'refunding') {
      return res.status(400).json({ message: 'Refund already processed or in progress' });
    }

    // Check if the booking has been cancelled and recorded the cancellation time
    if (payment.log.status !== 'cancelled' || !payment.log.cancelledAt) {
      return res.status(400).json({ message: 'Refund requests can only be processed for cancelled bookings' });
    }

    const cancellationTime = new Date(payment.log.cancelledAt);
    const startTime = new Date(payment.log.startTime);
    const hoursDifference = (startTime - cancellationTime) / (1000 * 60 * 60);

    // Check for automatic refund eligibility
    if (hoursDifference >= 24) {
      const refund = await processAutomaticRefund(payment, userId, reason);
      res.json({ message: 'Refund processed automatically', refundId: refund.refund_id });
    } else {
      // Proceed with a normal refund request
      const refund = await db.Refund.create({
        payment_id: paymentId,
        amount: payment.amount,
        status: 'requested',
        reason: reason,
        receiptUrl: payment.receiptUrl,
        log_id: payment.log.log_id,
        createdBy: userId,
        updatedBy: userId
      });

      res.json({ message: 'Refund request submitted for review', refundId: refund.refund_id });
    }
  } catch (error) {
    console.error('Failed to request refund:', error);
    res.status(500).send({ message: error.message });
  }
});


// Helper function to handle automatic refunds
async function processAutomaticRefund(payment, userId, reason) {
  const stripeRefund = await stripe.refunds.create({
    charge: payment.stripePaymentId,
    amount: Math.floor(payment.amount * 100) // Convert to pence for Stripe API
  });

  const refund = await db.Refund.create({
    payment_id: payment.payment_id,
    amount: payment.amount,
    status: 'approved',
    reason: reason,
    decision: 'Automatic refund for cancellation more than 24 hours before start time',
    log_id: payment.log.log_id,
    stripeRefundId: stripeRefund.id,
    processedAt: new Date(),
    createdBy: userId,
    updatedBy: userId
  });

  await db.Payment.update({ paymentStatus: 'refunded' }, { where: { payment_id: payment.payment_id } });
  await db.CarParkLog.update({ status: 'refunded' }, { where: { log_id: payment.log.log_id } });

  return refund;
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

// Admin function for approving refunds
app.post('/api/refunds/:refundId/approve', authenticateToken, verifyRole(['admin']), async (req, res) => {
  const { refundId } = req.params;
  const { decision } = req.body;

  if (!decision) return res.status(400).send('Decision for approval is required');

  try {
    // Only find refunds that are 'requested' or 'denied'
    const refund = await db.Refund.findOne({
      where: { refund_id: refundId, status: ['requested', 'denied'] },
      include: [{ model: db.Payment, as: 'payment', include: [{ model: db.CarParkLog, as: 'log' }] }]
    });

    if (!refund) return res.status(404).send('Refund request not found or already processed');

    const stripeRefund = await stripe.refunds.create({
      charge: refund.payment.stripePaymentId,
      amount: Math.floor(refund.amount * 100)
    });

    // Start a new transaction
    const transaction = await db.sequelize.transaction();

    try {
      // Update the Refund record
      await refund.update({
        stripeRefundId: stripeRefund.id,
        status: 'approved',
        decision: req.body.decision || 'Approved by Admin',
        processedAt: new Date(),
        updatedBy: req.user.userId
      }, { transaction });

      // Update the associated Payment and CarParkLog
      await db.Payment.update(
        { paymentStatus: 'refunded' },
        { where: { payment_id: refund.payment_id } },
        { transaction }
      );

      if (refund.payment.log) {
        await db.CarParkLog.update(
          { status: 'refunded' },
          { where: { log_id: refund.payment.log.log_id } },
          { transaction }
        );
      }

      // Commit the transaction
      await transaction.commit();

      res.json({ message: 'Refund approved successfully', refund });
    } catch (error) {
      // If there is a failure, rollback the transaction
      await transaction.rollback();
      throw error;
    }
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
