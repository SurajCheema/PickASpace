<template>
  <div class="user-dashboard">
    <h1><span class="blue">User</span> Dashboard</h1>
    <p>Welcome to your dashboard. Manage your profile, view payment and booking logs.</p>
    
    <div class="status-card">
      <p v-if="stripeStatus === 'submitted'" class="alert alert-success">Your Stripe account is fully activated.</p>
      <p v-else-if="stripeStatus === 'pending'" class="alert alert-warning">Your Stripe account activation is pending. Please complete the required steps.</p>
      <p v-else-if="stripeStatus === 'error'" class="alert alert-danger">Error loading Stripe account status. Please try again later.</p>
      <p v-else class="alert alert-info">Your Stripe account is not activated. <router-link to="/onboarding">Complete Stripe Onboarding</router-link></p>
    </div>

    <div class="dashboard-buttons">
      <router-link to="/user/profile" class="dashboard-link">
        <button type="button" class="btn btn-info">Profile</button>
      </router-link>
      <router-link to="/user/payments" class="dashboard-link">
        <button type="button" class="btn btn-info">Payment Logs</button>
      </router-link>
      <router-link to="/user/bookings" class="dashboard-link">
        <button type="button" class="btn btn-success">Booking Logs</button>
      </router-link>
      <router-link to="/user/carparks" class="dashboard-link">
        <button type="button" class="btn btn-success">Manage Car Parks</button>
      </router-link>
      <router-link to="/user/earnings" class="dashboard-link">
        <button type="button" class="btn btn-warning">View Earnings</button>
      </router-link>
      <router-link to="/onboarding" class="dashboard-link">
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
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
  text-align: center;
  background-color: #f4f4f4; /* Matching the light gray from login */
}

.status-card {
  padding: 20px;
  background: #f9f9fa;
  border-left: 5px solid #31708f;
  margin-bottom: 20px;
}

.dashboard-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.dashboard-buttons .btn {
  width: 100%; /* Full width buttons for better touch targets */
  padding: 10px; /* Larger click area */
}

.dashboard-link {
  text-decoration: none;
}

.alert {
  padding: 10px;
  border-radius: 5px;
  color: #fff;
}

.alert-success {
  background-color: #28a745;
}

.alert-warning {
  background-color: #ffc107;
}

.alert-danger {
  background-color: #dc3545;
}

.alert-info {
  background-color: #17a2b8;
}

@media (min-width: 992px) {
  .user-dashboard {
    width: 50%; /* 50% width on large screens */
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .user-dashboard {
    width: 60%; /* 60% width on normal screens */
  }
}

@media (max-width: 767px) {
  .user-dashboard {
    width: 100%; /* Full width on small screens */
  }
}
</style>
