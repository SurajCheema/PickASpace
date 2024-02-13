<template>
    <nav>
      <!-- Navigation Links -->
      <router-link to="/">Home</router-link>
      <!-- More links can be added here -->
  
      <!-- Logout Button -->
      <button v-if="isLoggedIn" @click="logout">Logout</button>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'Navbar',
    computed: {
      isLoggedIn() {
        // Check if user is logged in by checking for a token
        return !!localStorage.getItem('token');
      }
    },
    methods: {
      logout() {
        // Remove token from localStorage
        localStorage.removeItem('token');
        // Redirect to login page or home page
        this.$router.push('/login');
      }
    }
  }
  </script>
  
  <style>
  nav {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background-color: #f5f5f5;
  }
  
  nav a {
    margin-right: 1rem;
  }
  </style>
  