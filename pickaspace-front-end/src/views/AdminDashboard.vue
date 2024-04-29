<template>
    <div class="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <b-button variant="primary" @click="goToRefunds">Manage Refunds</b-button>
    </div>
  </template>
  
  <script>
  import { BButton } from 'bootstrap-vue-next';
  
  export default {
    name: 'AdminDashboard',
    components: {
      BButton
    },
    methods: {
      goToRefunds() {
        this.$router.push({ name: 'AdminRefundRequests' });
      }
    }
  }
  </script>
  
  <style scoped>
  .admin-dashboard {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  </style>