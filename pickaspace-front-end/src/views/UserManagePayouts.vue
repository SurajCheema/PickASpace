<template>
    <div class="container mt-4">
      <h2 class="mb-4">Manage Payouts</h2>
      <div v-if="loading">
        <p>Loading...</p>
      </div>
      <div v-else>
        <h4>Total Earnings: £{{ totalEarnings.toFixed(2) }}</h4>
        <button class="btn btn-primary" @click="openStripeDashboard">
          Manage Payouts
        </button>
        <button class="btn btn-secondary" @click="fetchTransactions">
          View Transactions
        </button>
        <div v-if="transactions.length">
          <h4>Transactions</h4>
          <ul>
            <li v-for="transaction in transactions" :key="transaction.id">
              ID: {{ transaction.id }}, Amount: £{{ (transaction.amount / 100).toFixed(2) }}, Type: {{ transaction.type }}
            </li>
          </ul>
        </div>
        <p v-if="message" class="mt-3">{{ message }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import { fetchStripeDashboardLink, fetchStripeBalance, fetchTransactions } from '@/services/paymentService';
  
  export default {
    data() {
      return {
        loading: true,
        transactions: [],
        message: '',
        totalEarnings: 0,
        balanceDetails: null
      };
    },
    created() {
      this.loadBalance();
    },
    methods: {
      async openStripeDashboard() {
        try {
          this.loading = true;
          const { url } = await fetchStripeDashboardLink();
          window.open(url, '_blank');
        } catch (error) {
          this.message = "Failed to open Stripe dashboard.";
          console.error('Dashboard opening failed:', error);
        } finally {
          this.loading = false;
        }
      },
      async fetchTransactions() {
        this.loading = true;
        try {
          const stripeAccountId = this.balanceDetails.stripe_account_id; // Assuming balanceDetails has stripe_account_id
          const data = await fetchTransactions(stripeAccountId);
          this.transactions = data;
        } catch (error) {
          this.message = 'Failed to load transactions.';
          console.error('Error loading transactions:', error);
        } finally {
          this.loading = false;
        }
      },
      async loadBalance() {
        try {
          const data = await fetchStripeBalance();
          this.totalEarnings = data.totalEarnings / 100; // Convert from cents to pounds if needed
          this.balanceDetails = data;
        } catch (error) {
          this.message = 'Failed to load balance.';
          console.error('Error loading Stripe balance:', error);
        } finally {
          this.loading = false;
        }
      }
    }
  }
  </script>
  