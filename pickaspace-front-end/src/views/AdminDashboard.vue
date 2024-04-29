<template>
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        <button @click="handleRefundRequests">View Refund Requests</button>
        <!-- Add more buttons or links for other admin functionalities -->
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AdminDashboard',
    methods: {
      handleRefundRequests() {
        this.$router.push({ name: 'AdminRefundRequests' });
      }
    }
  }
  </script>
  