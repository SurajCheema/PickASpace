<template>
  <div class="register-container">
    <h1>Register</h1>
    <form @submit.prevent="registerUser" v-if="!registrationSuccess">
        <div class="form-group">
          <label for="carRegistration">Car Registration:</label>
          <input type="text" class="form-control" id="carRegistration" v-model="user.car_registration" required>
        </div>
        <div class="form-group">
          <label for="firstName">First Name:</label>
          <input type="text" class="form-control" id="firstName" v-model="user.first_name" required>
        </div>
        <div class="form-group">
          <label for="lastName">Last Name:</label>
          <input type="text" class="form-control" id="lastName" v-model="user.last_name" required>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" class="form-control" id="email" v-model="user.email" required>
          <div v-if="emailError" class="text-danger">{{ emailError }}</div>
        </div>
        <div class="form-group">
          <label for="emailConfirm">Confirm Email:</label>
          <input type="email" class="form-control" id="emailConfirm" v-model="emailConfirm" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" class="form-control" id="password" v-model="user.password" required>
          <div v-if="passwordError" class="text-danger">{{ passwordError }}</div>
        </div>
        <div class="form-group">
          <label for="passwordConfirm">Confirm Password:</label>
          <input type="password" class="form-control" id="passwordConfirm" v-model="passwordConfirm" required>
        </div>
        <div class="form-group">
          <label for="phone">Phone Number:</label>
          <input type="tel" class="form-control" id="phone" v-model="user.phone" required>
        </div>
        <div class="form-group">
          <label for="dob">Date of Birth:</label>
          <input type="date" class="form-control" id="dob" v-model="user.DOB" required>
        </div>
        <button type="submit" class="btn btn-primary">Register</button>
      </form>
      <div v-if="registrationSuccess" class="alert alert-success">
        Registration successful! <a href="#" @click="redirectToLogin">Click here</a> to go to the login page.
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
        emailConfirm: '',
        passwordConfirm: '',
        emailError: '',
        passwordError: '',
        registrationSuccess: false
      };
    },
    watch: {
    emailConfirm(newVal) {
      if (this.user.email !== newVal) {
        this.emailError = 'Emails do not match!';
      } else {
        this.emailError = '';
      }
    },
    passwordConfirm(newVal) {
      if (this.user.password !== newVal) {
        this.passwordError = 'Passwords do not match!';
      } else {
        this.passwordError = '';
      }
    }
  },
    methods: {
    async registerUser() {
      if (this.emailError || this.passwordError) {
        return; // Prevent registration if there are errors
      }
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
  