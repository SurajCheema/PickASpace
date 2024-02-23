<template>
    <div class="container mt-5">
      <h1 class="text-center mb-3">PickASpace</h1>
      <h2 class="text-center text-muted mb-5">Smart, Stress-Free City Parking</h2>
      <p class="lead text-center mb-5">
        Welcome to PickASpace, the innovative car parking app currently under development. Our mission is to make urban parking not just easier, but smarter. With PickASpace, you'll be able to find and secure parking spaces with unprecedented ease and efficiency.
      </p>
      <div class="row justify-content-center">
        <div class="col-md-4 d-grid gap-2">
          <router-link to="/login" class="btn btn-primary">Login</router-link>
        </div>
        <div class="col-md-4 d-grid gap-2">
          <router-link to="/register" class="btn btn-secondary">Register</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomeView',
  };
  </script>
  
  <style scoped>
  </style>
  