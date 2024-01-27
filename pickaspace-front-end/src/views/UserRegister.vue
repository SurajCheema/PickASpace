<template>
  <div class="register-container">
    <h1>Register</h1>
    <form @submit.prevent="registerUser" v-if="!registrationSuccess">
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
      <div v-if="registrationSuccess" class="success-message">
      <p>Registration successful! <a href="#" @click="redirectToLogin">Click here</a> to go to the login page.</p>
    </div>
  </div>
</template>
  
  <script>
  import { registerUser } from '../services/userService';
  
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
        },
        registrationSuccess: false
      };
    },

    methods: {
    async registerUser() {
      try {
        const result = await registerUser(this.user);
        console.log('User registered:', result);
        this.registrationSuccess = true;
      } catch (error) {
        console.error('Registration failed:', error);
      }
    },
    redirectToLogin() {
      this.$router.push('/login');
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

  .success-message {
  color: green;
  margin-top: 20px;
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
  