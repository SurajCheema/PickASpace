<template>
    <div class="password-reset-container">
      <h1>Reset Your Password</h1>
      <form @submit.prevent="requestPasswordReset">
        <div class="form-group">
          <label for="email">Enter your email:</label>
          <input type="email" id="email" v-model="email" required placeholder="Your email">
        </div>
        <button type="submit" class="reset-button">Send Reset Link</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const email = ref('');
  
  function requestPasswordReset() {
    // Need to add actual API call here
    console.log('Requesting password reset for:', email.value);
    // Placeholder for success feedback
    alert('If the email is registered, you will receive a password reset link.');
  }
  </script>
  
  <style scoped>
  .password-reset-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  input[type="email"] {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .reset-button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .reset-button:hover {
    background-color: #45a049;
  }
  </style>
  