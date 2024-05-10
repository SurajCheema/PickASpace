<template>
  <div class="user-dashboard">
    <h1>User Dashboard</h1>
    <p>Welcome to your dashboard. Manage your profile, view payment and booking logs.</p>
    <div>
  <p v-if="stripeStatus === 'submitted'">Your Stripe account is fully activated.</p>
  <p v-else-if="stripeStatus === 'pending'">Your Stripe account activation is pending. Please complete the required steps.</p>
  <p v-else-if="stripeStatus === 'error'">Error loading Stripe account status. Please try again later.</p>
  <p v-else>Your Stripe account is not activated. <router-link to="/onboarding">Complete Stripe Onboarding</router-link></p>
</div>
    <div class="dashboard-buttons">
      <router-link to="/user/profile">
        <button type="button" class="btn btn-primary">Profile</button>
      </router-link>
      <router-link to="/user/payments">
        <button type="button" class="btn btn-secondary">Payment Logs</button>
      </router-link>
      <router-link to="/user/bookings">
        <button type="button" class="btn btn-success">Booking Logs</button>
      </router-link>
      <router-link to="/onboarding">
        <button type="button" class="btn btn-warning">Complete Stripe Onboarding</button>
      </router-link>
    </div>
  </div>
</template>

<script>
import { checkStripeAccountStatus } from '../services/paymentService';

export default {
  data() {
    return {
      stripeAccountId: 'your-stripe-account-id-from-user-model', // Fetch or define accordingly
      stripeStatus: null,
    };
  },
  created() {
    this.loadStripeStatus();
  },
  methods: {
    async loadStripeStatus() {
  try {
    const statusData = await checkStripeAccountStatus(this.stripeAccountId);
    this.stripeStatus = statusData.status;
  } catch (error) {
    console.error('Error loading Stripe status:', error);
    this.stripeStatus = 'error';
  }
}  
}
}
</script>

<style>
.user-dashboard {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.dashboard-buttons {
  margin-top: 20px;
}

.dashboard-buttons .btn {
  margin: 0 10px;
}
</style>