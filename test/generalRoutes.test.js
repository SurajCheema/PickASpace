const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../server');
const db = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

require('./testSetup'); // Include the common setup and teardown

describe('User Endpoints', function () {
    let userToken;
    let adminToken;
    let user;
    let admin;
    let owner;
    let carPark;

    before(async function () {
        // Create a user, an admin, and an owner
        user = await db.User.create({
            email: 'user@test.com',
            password: await bcrypt.hash('test', 10),
            first_name: 'John',
            last_name: 'Doe',
            DOB: new Date('1990-01-01'),
            car_registration: 'AA19AAA',
            phone: '+44123456789',
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
            stripe_account_id: 'acct_1PEfNpCYeKEb7cFa'
        });

        admin = await db.User.create({
            email: 'admin@test.com',
            password: await bcrypt.hash('test', 10),
            first_name: 'Admin',
            last_name: 'User',
            DOB: new Date('1990-01-01'),
            car_registration: 'AA19AAA',
            phone: '+44123456789',
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
            stripe_account_id: 'acct_1PEfNpCYeKEb7cFa'
        });

        owner = await db.User.create({
            email: 'owner@test.com',
            password: await bcrypt.hash('test', 10),
            first_name: 'Owner',
            last_name: 'Park',
            DOB: new Date('1990-01-01'),
            car_registration: 'AA19BBB',
            phone: '+44123456790',
            role: 'owner',
            createdAt: new Date(),
            updatedAt: new Date(),
            stripe_account_id: 'acct_1PEfNpCYeKEb7cFb'
        });

        carPark = await db.CarPark.create({
            user_id: owner.user_id,
            addressLine1: 'Owner Address',
            city: 'Owner City',
            postcode: 'Owner Postcode',
            pricing: { hourly: 2 },
        });

        userToken = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET);
        adminToken = jwt.sign({ userId: admin.user_id, role: admin.role }, process.env.JWT_SECRET);
    });

    describe('POST /api/book-bay', function () {
        it('should successfully book a bay and process payment', async function () {
            const bay = await db.Bay.create({
                carpark_id: carPark.carpark_id,
                bay_number: 1,
            });

            const res = await request(app)
                .post('/api/book-bay')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    bay_id: bay.bay_id,
                    carpark_id: carPark.carpark_id,
                    startTime: new Date(Date.now() + 60 * 60 * 1000),
                    endTime: new Date(Date.now() + 120 * 60 * 1000),
                    cost: 10,
                    stripeToken: 'tok_visa',
                });

            expect(res.statusCode).to.equal(200);
            expect(res.body.message).to.equal('Booking and payment successful');
        });

        it('should return an error for overlapping booking times', async function () {
            const bay = await db.Bay.create({
                carpark_id: carPark.carpark_id,
                bay_number: 1,
            });

            const existingBooking = await db.CarParkLog.create({
                bay_id: bay.bay_id,
                carpark_id: carPark.carpark_id,
                user_id: user.user_id,
                startTime: new Date(),
                endTime: new Date(Date.now() + 60 * 60 * 1000),
                cost: 10,
            });

            const res = await request(app)
                .post('/api/book-bay')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    bay_id: bay.bay_id,
                    carpark_id: carPark.carpark_id,
                    startTime: new Date(Date.now() + 30 * 60 * 1000),
                    endTime: new Date(Date.now() + 90 * 60 * 1000),
                    cost: 10,
                    stripeToken: 'tok_visa',
                });

            expect(res.statusCode).to.equal(400);
            expect(res.body.error).to.equal('The requested bay is not available or already booked.');
        });
    });

    describe('PUT /api/cancel-booking/:bookingId', function () {
        it('should successfully cancel a booking', async function () {
            const booking = await db.CarParkLog.create({
                bay_id: 1,
                carpark_id: 1,
                user_id: user.user_id,
                startTime: new Date(),
                endTime: new Date(Date.now() + 60 * 60 * 1000),
                cost: 10,
            });

            const res = await request(app)
                .put(`/api/cancel-booking/${booking.log_id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body.message).to.equal('Booking cancelled successfully');
        });

        it('should return an error for invalid booking ID', async function () {
            const res = await request(app)
                .put('/api/cancel-booking/9999')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(404);
            expect(res.text).to.equal('Booking not found');
        });
    });

    describe('GET /api/user/bookings', function () {
        it("should fetch user's booking logs", async function () {
            const res = await request(app)
                .get('/api/user/bookings')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.all.keys('current', 'upcoming', 'past');
        });

        it('should return an error for unauthenticated requests', async function () {
            const res = await request(app)
                .get('/api/user/bookings');

            expect(res.statusCode).to.equal(401);
            expect(res.text).to.equal('Token is required');
        });
    });

    describe('GET /api/user/bookings/:log_id', function () {
        it('should fetch a specific booking by ID for a user', async function () {
            const booking = await db.CarParkLog.create({
                bay_id: 1,
                carpark_id: 1,
                user_id: user.user_id,
                startTime: new Date(),
                endTime: new Date(Date.now() + 60 * 60 * 1000),
                cost: 10,
            });

            const res = await request(app)
                .get(`/api/user/bookings/${booking.log_id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('object');
            expect(res.body.log_id).to.equal(booking.log_id);
        });

        it('should return an error for invalid booking ID', async function () {
            const res = await request(app)
                .get('/api/user/bookings/9999')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(404);
            expect(res.text).to.equal('Booking not found');
        });
    });

    describe('GET /api/user/payments', function () {
        it('should fetch all payment records for a logged-in user', async function () {
            const res = await request(app)
                .get('/api/user/payments')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('should return an error for unauthenticated requests', async function () {
            const res = await request(app)
                .get('/api/user/payments');

            expect(res.statusCode).to.equal(401);
            expect(res.text).to.equal('Token is required');
        });
    });

    describe('GET /api/payments/:paymentId', function () {
        it('should fetch a specific payment by ID', async function () {
            const payment = await db.Payment.create({
                stripePaymentId: 'ch_test123',
                amount: 10,
                paymentStatus: 'completed',
                userId: user.user_id,
            });

            const res = await request(app)
                .get(`/api/payments/${payment.payment_id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('object');
            expect(res.body.payment_id).to.equal(payment.payment_id);
        });

        it('should return an error for invalid payment ID', async function () {
            const res = await request(app)
                .get('/api/payments/9999')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(404);
            expect(res.text).to.equal('Payment not found');
        });
    });

    describe('POST /api/request-refund', function () {
        it('should request a refund for a payment', async function () {
            const payment = await db.Payment.create({
                stripePaymentId: 'ch_test123',
                amount: 10,
                paymentStatus: 'completed',
                userId: user.user_id,
            });
    
            const booking = await db.CarParkLog.create({
                bay_id: 1,
                carpark_id: 1,
                user_id: user.user_id,
                payment_id: payment.payment_id,
                startTime: new Date(),
                endTime: new Date(Date.now() + 60 * 60 * 1000),
                cost: 10,
            });
    
            // First cancel the booking
            const cancelRes = await request(app)
                .put(`/api/cancel-booking/${booking.log_id}`)
                .set('Authorization', `Bearer ${userToken}`);
    
            expect(cancelRes.statusCode).to.equal(200);
            expect(cancelRes.body.message).to.equal('Booking cancelled successfully');
    
            // Then request a refund
            const refundRes = await request(app)
                .post('/api/request-refund')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    paymentId: payment.payment_id,
                    reason: 'Test refund',
                });
    
            expect(refundRes.statusCode).to.equal(200);
            expect(refundRes.body.message).to.equal('Refund request submitted for review');
        });
    
        it('should automatically process refund for cancellations more than 24 hours before start time', async function () {
            const payment = await db.Payment.create({
                stripePaymentId: 'ch_test123',
                amount: 10,
                paymentStatus: 'completed',
                userId: user.user_id,
            });
    
            const booking = await db.CarParkLog.create({
                bay_id: 1,
                carpark_id: 1,
                user_id: user.user_id,
                payment_id: payment.payment_id,
                startTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
                endTime: new Date(Date.now() + 50 * 60 * 60 * 1000),
                cost: 10,
            });
    
            // First cancel the booking
            const cancelRes = await request(app)
                .put(`/api/cancel-booking/${booking.log_id}`)
                .set('Authorization', `Bearer ${userToken}`);
    
            expect(cancelRes.statusCode).to.equal(200);
            expect(cancelRes.body.message).to.equal('Booking cancelled successfully');
    
            // Then request a refund
            const refundRes = await request(app)
                .post('/api/request-refund')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    paymentId: payment.payment_id,
                    reason: 'Test automatic refund',
                });
    
            expect(refundRes.statusCode).to.equal(200);
            expect(refundRes.body.message).to.equal('Refund processed automatically');
        });
    });
    

    describe('GET /api/refunds', function () {
        it('should fetch all refunds with optional filters and admin verification', async function () {
            const res = await request(app)
                .get('/api/refunds')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('should return an error for unauthenticated requests', async function () {
            const res = await request(app)
                .get('/api/refunds');

            expect(res.statusCode).to.equal(401);
            expect(res.text).to.equal('Token is required');
        });

        it('should return an error for unauthorized requests', async function () {
            const res = await request(app)
                .get('/api/refunds')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(403);
            expect(res.text).to.equal('Access denied: You do not have permission to access this resource');
        });
    });

    describe('POST /api/refunds/:refundId/approve', function () {
        it('should approve a refund request by an admin', async function () {
            const payment = await db.Payment.create({
                stripePaymentId: 'ch_test123',
                amount: 10,
                paymentStatus: 'completed',
                userId: user.user_id,
            });

            const refund = await db.Refund.create({
                payment_id: payment.payment_id,
                amount: 10,
                status: 'requested',
                reason: 'Test refund',
                log_id: 1,
                createdBy: user.user_id,
                updatedBy: user.user_id,
            });

            const res = await request(app)
                .post(`/api/refunds/${refund.refund_id}/approve`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    decision: 'Refund approved',
                });

            expect(res.statusCode).to.equal(200);
            expect(res.body.message).to.equal('Refund approved successfully');
        });

        it('should return an error for invalid refund ID', async function () {
            const res = await request(app)
                .post('/api/refunds/9999/approve')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    decision: 'Refund approved',
                });

            expect(res.statusCode).to.equal(404);
            expect(res.text).to.equal('Refund request not found or already processed');
        });
    });

    describe('POST /api/refunds/:refundId/deny', function () {
        it('should deny a refund request by an admin', async function () {
            const payment = await db.Payment.create({
                stripePaymentId: 'ch_test123',
                amount: 10,
                paymentStatus: 'completed',
                userId: user.user_id,
            });

            const refund = await db.Refund.create({
                payment_id: payment.payment_id,
                amount: 10,
                status: 'requested',
                reason: 'Test refund',
                log_id: 1,
                createdBy: user.user_id,
                updatedBy: user.user_id,
            });

            const res = await request(app)
                .post(`/api/refunds/${refund.refund_id}/deny`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    decision: 'Refund denied',
                });

            expect(res.statusCode).to.equal(200);
            expect(res.body.message).to.equal('Refund denied successfully');
        });

        it('should return an error for invalid refund ID', async function () {
            const res = await request(app)
                .post('/api/refunds/9999/deny')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    decision: 'Refund denied',
                });

            expect(res.statusCode).to.equal(404);
            expect(res.text).to.equal('Refund request not found');
        });
    });

    describe('GET /api/refunds/:refundId', function () {
        it('should fetch a specific refund by ID (admin)', async function () {
            const payment = await db.Payment.create({
                stripePaymentId: 'ch_test123',
                amount: 10,
                paymentStatus: 'completed',
                userId: user.user_id,
            });
            const refund = await db.Refund.create({
                payment_id: payment.payment_id,
                amount: 10,
                status: 'denied',
                reason: 'Test refund',
                createdBy: user.user_id,
                updatedBy: user.user_id,
            });

            const res = await request(app)
                .get(`/api/refunds/${refund.refund_id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('object');
            expect(res.body.refund_id).to.equal(refund.refund_id);
        });

        it('should return an error for invalid refund ID', async function () {
            const res = await request(app)
                .get('/api/refunds/9999')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).to.equal(404);
            expect(res.text).to.equal('Refund request not found or not in denied status');
        });
    });

    describe('POST /api/refunds/:refundId/resubmit', function () {
        it('should resubmit a denied refund request by a user', async function () {
            const payment = await db.Payment.create({
                stripePaymentId: 'ch_test123',
                amount: 10,
                paymentStatus: 'completed',
                userId: user.user_id,
            });
            const refund = await db.Refund.create({
                payment_id: payment.payment_id,
                amount: 10,
                status: 'denied',
                reason: 'Test refund',
                createdBy: user.user_id,
                updatedBy: user.user_id,
                log_id: 1,
            });

            const res = await request(app)
                .post(`/api/refunds/${refund.refund_id}/resubmit`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    reason: 'Resubmitted refund request',
                });

            expect(res.statusCode).to.equal(200);
            expect(res.body.message).to.equal('Refund request resubmitted successfully');
        });

        it('should return an error for invalid refund ID', async function () {
            const res = await request(app)
                .post('/api/refunds/9999/resubmit')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    reason: 'Resubmitted refund request',
                });

            expect(res.statusCode).to.equal(404);
            expect(res.text).to.equal('Refund request not found or not in denied status');
        });
    });

    describe('GET /api/refunds/payment/:paymentId', function () {
        it('should fetch a refund by Payment ID', async function () {
            const payment = await db.Payment.create({
                stripePaymentId: 'ch_test123',
                amount: 10,
                paymentStatus: 'completed',
                userId: user.user_id,
            });
            const refund = await db.Refund.create({
                payment_id: payment.payment_id,
                amount: 10,
                status: 'requested',
                reason: 'Test refund',
                createdBy: user.user_id,
                updatedBy: user.user_id,
                log_id: 1,
            });

            const res = await request(app)
                .get(`/api/refunds/payment/${payment.payment_id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('object');
            expect(res.body.refund_id).to.equal(refund.refund_id);
        });

        it('should return an error for invalid payment ID', async function () {
            const res = await request(app)
                .get('/api/refunds/payment/9999')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(404);
            expect(res.text).to.equal('Refund not found for the given payment ID');
        });
    });

    describe('GET /api/stripe/dashboard-link', function () {
        it('should create a Stripe dashboard link for a user', async function () {
            const res = await request(app)
                .get('/api/stripe/dashboard-link')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('url');
        });

        it('should return an error for unauthenticated requests', async function () {
            const res = await request(app)
                .get('/api/stripe/dashboard-link');

            expect(res.statusCode).to.equal(401);
            expect(res.text).to.equal('Token is required');
        });
    });

    describe('GET /api/stripe/balance', function () {
        it('should fetch the Stripe balance for a user', async function () {
            const res = await request(app)
                .get('/api/stripe/balance')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.all.keys('available', 'pending', 'totalEarnings');
        });

        it('should return an error for unauthenticated requests', async function () {
            const res = await request(app)
                .get('/api/stripe/balance');

            expect(res.statusCode).to.equal(401);
            expect(res.text).to.equal('Token is required');
        });

        it('should return an error for missing Stripe account ID', async function () {
            const userWithoutStripeAccount = await db.User.create({
                email: 'nostripe@test.com',
                password: await bcrypt.hash('test', 10),
                first_name: 'No',
                last_name: 'Stripe',
                DOB: new Date('1990-01-01'),
                car_registration: 'AA19AAA',
                phone: '+44123456789',
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const token = jwt.sign({ userId: userWithoutStripeAccount.user_id, role: userWithoutStripeAccount.role }, process.env.JWT_SECRET);

            const res = await request(app)
                .get('/api/stripe/balance')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).to.equal(400);
            expect(res.body.error).to.equal('No Stripe account ID found');
        });
    });

    describe('GET /api/user/transactions/:accountId', function () {
        it('should fetch detailed transactions for a Stripe account', async function () {
            const res = await request(app)
                .get(`/api/user/transactions/${user.stripe_account_id}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('should return an error for invalid account ID', async function () {
            const res = await request(app)
                .get('/api/user/transactions/invalid_account_id')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).to.equal(404);
            expect(res.body.error).to.equal('No transactions found for the given account ID');
        });
    });

    describe('GET /api/user/carparks', function () {
        it("should fetch user's car parks", async function () {
            const res = await request(app)
                .get('/api/user/carparks')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('should not return soft-deleted car parks', async function () {
            const carPark = await db.CarPark.create({
                user_id: user.user_id,
                addressLine1: 'Test Address',
                city: 'Test City',
                postcode: 'Test Postcode',
                pricing: { hourly: 1 },
                deletedAt: new Date(),
            });

            const res = await request(app)
                .get('/api/user/carparks')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('array').that.is.empty;
        });

        it('should return an error for unauthenticated requests', async function () {
            const res = await request(app)
                .get('/api/user/carparks');

            expect(res.statusCode).to.equal(401);
            expect(res.text).to.equal('Token is required');
        });
    });
});
