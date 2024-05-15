<template>
  <div class="container mt-4">
    <h2 class="mb-4 label blue">Manage Payouts</h2>
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-else>
      <h4><span  class="label blue">Total Earnings:</span> £{{ totalEarnings.toFixed(2) }}</h4>
      <button class="btn btn-primary mb-4" @click="openStripeDashboard">
        Manage Payouts
      </button>
      <div v-if="transactions.length">
        <h4 class="label blue">Transactions</h4>
        <div class="list-group">
          <div
            v-for="transaction in transactions"
            :key="transaction.id"
            class="card mb-3"
          >
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title"><span class="label blue">Transaction ID:</span> {{ transaction.id }}</h5>
                <small class="text-muted">{{ transaction.type }}</small>
              </div>
              <p class="card-text"><span class="label blue">Amount:</span> £{{ (transaction.amount / 100).toFixed(2) }}</p>
              <p class="card-text"><span class="label blue">Fee:</span> £{{ (transaction.fee / 100).toFixed(2) }}</p>
              <div v-if="transaction.fee_details.length">
                <span class="label blue">Fee Details:</span>
                <ul class="list-unstyled">
                  <li v-for="detail in transaction.fee_details" :key="detail.type">
                    <span class="label blue">Fee Type:</span> {{ detail.type }}, 
                    <span class="label blue">Fee Amount:</span> £{{ (detail.amount / 100).toFixed(2) }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-if="message" class="mt-3 alert alert-warning">{{ message }}</p>
    </div>
  </div>
</template>
  
  <script>
  import { fetchStripeDashboardLink, fetchTransactions, fetchStripeBalance } from '@/services/paymentService';
  import { getUserDetails } from '@/services/userService';
  
  export default {
    data() {
      return {
        loading: true,
        transactions: [],
        message: '',
        totalEarnings: 0,
        userDetails: null,
      };
    },
    async created() {
      await this.loadData();
    },
    methods: {
      async openStripeDashboard() {
        try {
          this.loading = true;
          const { url } = await fetchStripeDashboardLink();
          window.open(url, '_blank');
        } catch (error) {
          this.message = 'Failed to open Stripe dashboard.';
          console.error('Dashboard opening failed:', error);
        } finally {
          this.loading = false;
        }
      },
      async loadData() {
        try {
          await this.fetchUserDetails();
          if (this.userDetails?.stripe_account_id) {
            console.log('Stripe Account ID:', this.userDetails.stripe_account_id); // Log for debugging
            await this.fetchTransactions(this.userDetails.stripe_account_id);
            await this.fetchBalance();
          } else {
            console.error('No Stripe Account ID found');
          }
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          this.loading = false;
        }
      },
      async fetchUserDetails() {
        try {
          const data = await getUserDetails();
          console.log('Fetched User Details:', data); // Log for debugging
          this.userDetails = data;
        } catch (error) {
          this.message = 'Failed to load user details.';
          console.error('Error loading user details:', error);
        }
      },
      async fetchBalance() {
        try {
          const data = await fetchStripeBalance();
          console.log('Fetched Balance Details:', data); // Log for debugging
          this.totalEarnings = data.totalEarnings / 100;
        } catch (error) {
          this.message = 'Failed to load balance.';
          console.error('Error loading Stripe balance:', error);
        }
      },
      async fetchTransactions(stripeAccountId) {
        try {
          const data = await fetchTransactions(stripeAccountId);
          console.log('Fetched Transactions:', data); // Log for debugging
          this.transactions = data.data;
        } catch (error) {
          this.message = 'Failed to load transactions.';
          console.error('Error loading transactions:', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    padding: 20px;
    background-color: #f4f4f4; /* Light gray background consistent with other pages */
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
    width: 60%; /* Default width for large screens */
    margin: auto; /* Center align the container */
  }
  
  @media (min-width: 992px) {
    .container {
      width: 60%; /* Use 60% of the screen width on large screens */
    }
  }
  
  @media (min-width: 768px) and (max-width: 991px) {
    .container {
      width: 70%; /* Use 70% of the screen width on medium screens */
    }
  }
  
  @media (max-width: 767px) {
    .container {
      width: 100%; /* Use 100% of the screen width on small screens */
    }
  }

  .label{
    font-weight: bold;
  }
  
  .card {
    border-color: #ddd; /* Soft border color */
    transition: transform 0.3s ease; /* Smooth transition for transform */
  }
  
  .card:hover {
    transform: scale(1.05); /* Scale up the card by 5% on hover */
  }
  
  .card-body {
    padding: 1.25rem;
  }
  
  .card-title {
    font-size: 1.25rem; /* Slightly larger text for titles within cards */
  }
  
  .card-text {
    margin-bottom: 0.5rem; /* Consistent spacing for all text inside card */
  }
  
  .spinner-border {
    width: 3rem;
    height: 3rem; /* Larger spinner for better visibility */
  }
  
  .btn-primary {
    background-color: #4CAF50; /* Custom green background for buttons */
    border-color: #4CAF50; /* Border color to match the background */
  }
  
  .btn-primary:hover {
    background-color: #45a049; /* Darker shade on hover for depth effect */
  }
  
  .alert {
    color: #fff; /* White text color for alerts */
    background-color: #dc3545; /* Red background for alerts */
    border-radius: 0.25rem; /* Rounded corners for alert boxes */
  }
  </style>