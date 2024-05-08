<template>
  <div class="register-container">
    <h1>Register</h1>
    <form @submit.prevent="registerUser" v-if="!registrationSuccess">
      <div class="form-group">
        <label for="carRegistration">Car Registration:</label>
        <input type="text" class="form-control" id="carRegistration" v-model="user.car_registration"
          @blur="validateRegistrationPlate" required>
        <div v-if="registrationError" class="text-danger">{{ registrationError }}</div>
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
    <input type="password" class="form-control" id="password" v-model="user.password" @input="validatePassword" required>
    <div v-if="passwordError" class="text-danger">{{ passwordError }}</div>
  </div>
  <div class="form-group">
    <label for="passwordConfirm">Confirm Password:</label>
    <input type="password" class="form-control" id="passwordConfirm" v-model="passwordConfirm" @input="validatePassword" required>
  </div>
        <div class="form-group">
        <label for="phone">Phone Number:</label>
        <input type="tel" class="form-control" id="phone" v-model="user.phone" required>
      </div>
      <div class="form-group">
        <label for="dob">Date of Birth:</label>
        <input type="date" class="form-control" id="dob" v-model="user.DOB" required>
      </div>
      <button type="submit" class="btn btn-primary" :disabled="isRegistering">
        {{ isRegistering ? 'Registering...' : 'Register' }}
      </button>
    </form>
    <div v-if="registrationSuccess" class="alert alert-success">
      Registration successful! <a href="#" @click="redirectToLogin">Click here</a> to go to the login page.
    </div>
  </div>
</template>

<script>
import { registerUser } from '../services/userService';
import { fetchVehicleDetails } from '../services/vehicleService';

export default {
  name: 'UserRegister',
  data() {
    return {
      user: {
        car_registration: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        DOB: '',
      },
      emailConfirm: '',
      passwordConfirm: '',
      emailError: '',
      passwordError: '',
      registrationError: '',
      registrationSuccess: false,
      isRegistering: false,
    };
  },
  watch: {
    emailConfirm(newVal) {
      this.validateEmail(newVal);
    },
    'user.email'(newVal) {
      this.validateEmail(this.emailConfirm, newVal);
    },
    passwordConfirm(newVal) {
      this.validatePassword(newVal);
    },
    'user.password'(newVal) {
      this.validatePassword(this.passwordConfirm, newVal);
    },
  },
  methods: {
    async validateRegistrationPlate() {
      if (!this.user.car_registration.trim()) {
        this.registrationError = "Car registration cannot be empty.";
        return;
      }

      try {
        await fetchVehicleDetails(this.user.car_registration);
        this.registrationError = ''; // Clear any previous error
      } catch (error) {
        this.registrationError = error.message || "Failed to validate car registration.";
        console.error("Registration validation error:", error);
      }
    },
    validateEmail(confirmEmail, email = this.user.email) {
      if (email !== confirmEmail) {
        this.emailError = 'Emails do not match!';
      } else {
        this.emailError = '';
      }
    },
    validatePassword() {
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
      if (this.user.password !== this.passwordConfirm) {
        this.passwordError = 'Passwords do not match!';
      } else if (!passwordRegex.test(this.user.password)) {
        this.passwordError = 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.';
      } else {
        this.passwordError = '';
      }
    },
    async registerUser() {
      if (this.emailError || this.passwordError || this.registrationError) {
        return; // Prevent registration if there are email, password, or registration errors
      }

      try {
        this.isRegistering = true;

        const result = await registerUser(this.user);
        console.log('User registered:', result);
        this.registrationSuccess = true;
      } catch (error) {
        console.error('Registration failed:', error);
        this.registrationError = 'Registration failed. Please try again.';
      } finally {
        this.isRegistering = false;
      }
    },

    redirectToLogin() {
      this.$router.push('/login');
    },
  },
};
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