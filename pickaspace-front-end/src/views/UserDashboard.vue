<template>
    <div class="user-dashboard">
      <h1>User Dashboard</h1>
      <p>Welcome to your dashboard. Manage your profile, view payment and booking logs.</p>
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
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'UserDashboard'
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
  