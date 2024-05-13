<template>
    <div class="container mt-4">
      <h2 class="mb-4">Manage Payouts</h2>
      <div v-if="loading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div v-else>
        <h4>Total Earnings: £{{ totalEarnings.toFixed(2) }}</h4>
        <button class="btn btn-primary mb-4" @click="openStripeDashboard">
          Manage Payouts
        </button>
        <div v-if="transactions.length">
          <h4>Transactions</h4>
          <div class="list-group">
            <div
              v-for="transaction in transactions"
              :key="transaction.id"
              class="list-group-item list-group-item-action flex-column align-items-start"
            >
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">Transaction ID: {{ transaction.id }}</h5>
                <small>{{ transaction.type }}</small>
              </div>
              <p class="mb-1">Amount: £{{ (transaction.amount / 100).toFixed(2) }}</p>
              <p class="mb-1">Fee: £{{ (transaction.fee / 100).toFixed(2) }}</p>
              <div v-if="transaction.fee_details.length">
                <small>Fee Details:</small>
                <ul class="list-unstyled ml-3">
                  <li v-for="detail in transaction.fee_details" :key="detail.type">
                    Fee Type: {{ detail.type }}, Fee Amount: £{{ (detail.amount / 100).toFixed(2) }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <p v-if="message" class="mt-3">{{ message }}</p>
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
  .list-group-item {
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }
  .list-group-item h5 {
    font-size: 1.25rem;
  }
  .list-group-item p {
    margin-bottom: 0.5rem;
  }
  .list-group-item ul {
    margin: 0;
    padding: 0;
  }
  .spinner-border {
    width: 3rem;
    height: 3rem;
  }
  </style>
  