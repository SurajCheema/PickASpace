<template>
    <div class="auth-container">
      <h1>Login</h1>
      <form @submit.prevent="loginUser">
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="user.email" required>
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="user.password" required>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  </template>
  
  <script>
  import { loginUser } from '../services/userService';
  
  export default {
    name: 'UserLogin',
    data() {
      return {
        user: {
          email: '',
          password: ''
        }
      };
    },
    methods: {
      async loginUser() {
          try {
          await loginUser(this.user);
          console.log('User logged in');
          this.$router.push('/dashboard');
        } catch (error) {
          console.error('Login failed:', error);
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .auth-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .auth-container div {
    margin-bottom: 10px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  input[type="email"],
  input[type="password"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  </style>
  