'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Payments', [
      {
        stripePaymentId: 'ch_1IZL3YE82hoNmS4N0GbKrZuQ', // Example Stripe Payment ID for past log
        amount: 20.00, // Match cost in CarParkLog
        paymentStatus: 'completed',
        receiptUrl: 'http://example.com/receipt1',
        date_paid: new Date(new Date().getTime() - 3600 * 1000), // 1 hour ago
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        stripePaymentId: 'ch_1IZL3YE82hoNmS4N0GbKrZuQ2', // Example Stripe Payment ID for present log
        amount: 20.00, // Match cost in CarParkLog
        paymentStatus: 'completed',
        receiptUrl: 'http://example.com/receipt2',
        date_paid: new Date(), // Now
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        stripePaymentId: 'ch_1IZL3YE82hoNmS4N0GbKrZuQ3', // Example Stripe Payment ID for future log
        amount: 20.00, // Match cost in CarParkLog
        paymentStatus: 'pending',
        receiptUrl: 'http://example.com/receipt3',
        date_paid: new Date(new Date().getTime() + 24 * 3600 * 1000), // 24 hours from now
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Payments', null, {});
  }
};