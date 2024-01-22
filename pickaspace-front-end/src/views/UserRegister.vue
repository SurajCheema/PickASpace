<template>
    <div class="register-container">
      <h1>Register</h1>
      <form @submit.prevent="registerUser">
        <div>
          <label for="carRegistration">Car Registration:</label>
          <input type="text" id="carRegistration" v-model="user.car_registration" required>
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="user.email" required>
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="user.password" required>
        </div>
        <div>
          <label for="fullName">Full Name:</label>
          <input type="text" id="fullName" v-model="user.full_name" required>
        </div>
        <div>
          <label for="dob">Date of Birth:</label>
          <input type="date" id="dob" v-model="user.DOB" required>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'UserRegister',
    data() {
      return {
        user: {
          car_registration: '',
          email: '',
          password: '',
          full_name: '',
          DOB: ''
        }
      };
    },
    methods: {
      async registerUser() {
        // Add logic to handle user registration
        console.log('Registering user:', this.user);
        // Here you would typically make an HTTP request to your backend
        // For demonstration, we're just logging to the console
      }
    }
  }
  </script>
  
  <style scoped>
  .register-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .register-container div {
    margin-bottom: 10px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="date"] {
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
  