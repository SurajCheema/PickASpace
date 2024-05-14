<template>
  <div class="auth-container">
    <h1 class="blue">Register</h1>
    <form @submit.prevent="registerUser" v-if="!registrationSuccess">
      <div class="form-group">
        <label for="carRegistration">Car Registration:</label>
        <input type="text" id="carRegistration" v-model="user.car_registration" @blur="validateRegistrationPlate" required>
        <p class="error" v-if="registrationError">{{ registrationError }}</p>
      </div>
      <div class="form-group">
        <label for="firstName">First Name:</label>
        <input type="text" id="firstName" v-model="user.first_name" required>
        <p class="error" v-if="attemptedToRegister && !validateName(user.first_name)">
          First name cannot be empty, start/end with a space, or contain special characters.
        </p>
      </div>
      <div class="form-group">
        <label for="lastName">Last Name:</label>
        <input type="text" id="lastName" v-model="user.last_name" required>
        <p class="error" v-if="attemptedToRegister && !validateName(user.last_name)">
          Last name cannot be empty, start/end with a space, or contain special characters.
        </p>
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="user.email" required>
        <p class="error" v-if="emailError">{{ emailError }}</p>
      </div>
      <div class="form-group">
        <label for="emailConfirm">Confirm Email:</label>
        <input type="email" id="emailConfirm" v-model="emailConfirm" required>
        <p class="error" v-if="user.email !== emailConfirm">Emails do not match!</p>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="user.password" @input="validatePassword" required>
        <p class="error" v-if="passwordError">{{ passwordError }}</p>
      </div>
      <div class="form-group">
        <label for="passwordConfirm">Confirm Password:</label>
        <input type="password" id="passwordConfirm" v-model="passwordConfirm" @input="validatePassword" required>
        <p class="error" v-if="user.password !== passwordConfirm">Passwords do not match!</p>
      </div>
      <div class="form-group">
        <label for="phone">Phone Number:</label>
        <input type="tel" id="phone" v-model="user.phone" required>
      </div>
      <div class="form-group">
        <label for="dob">Date of Birth:</label>
        <input type="date" id="dob" v-model="user.DOB" required>
        <p class="error" v-if="attemptedToRegister && !isOldEnough">
          You must be at least 16 years old to register.
        </p>
      </div>
      <div class="form-group">
        <label for="blueBadge">Has Blue Badge:</label>
        <input type="checkbox" id="blueBadge" v-model="user.blueBadge">
      </div>
      <button type="submit" :disabled="isRegistering">
        {{ isRegistering ? 'Registering...' : 'Register' }}
      </button>
    </form>
    <p class="success-message" v-if="registrationSuccess">
      Registration successful! Redirecting in {{ countdown }} seconds... <br>
      <a href="/login" @click="cancelRedirect">Click here to login!</a>
    </p>
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
        blueBadge: false
      },
      emailConfirm: '',
      passwordConfirm: '',
      emailError: '',
      passwordError: '',
      registrationError: '',
      registrationSuccess: false,
      isRegistering: false,
      attemptedToRegister: false,
      countdown: 10,
      timer: null
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
  computed: {
    isOldEnough() {
      const today = new Date();
      const dob = new Date(this.user.DOB);
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age >= 16;
    }
  },
  methods: {
    validateName(name) {
      // Regex to allow only letters, spaces between words and disallow special characters and trailing spaces
      const regex = /^[A-Za-z]+(?:[ ]?[A-Za-z]+)*$/;
      return regex.test(name);
    },
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
    validateEmail() {
      const confirmEmail = this.emailConfirm;
      const email = this.user.email;
      if (email !== confirmEmail) {
        this.emailError = 'Emails do not match!';
      } else {
        this.emailError = '';
      }
    },
    validatePassword() {
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
      if (this.user.password !== this.passwordConfirm) {
        this.passwordError = 'Passwords do not match!';
      } else if (!passwordRegex.test(this.user.password)) {
        this.passwordError = 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
      } else {
        this.passwordError = '';
      }
    },
    async registerUser() {
      this.attemptedToRegister = true;
      if (!this.validateName(this.user.first_name) || !this.validateName(this.user.last_name) || !this.isOldEnough || this.emailError || this.passwordError) {
        return; // Prevent registration if there are validations errors
      }
      try {
        this.isRegistering = true;
        const result = await registerUser(this.user);
        console.log('User registered:', result);
        this.registrationSuccess = true;
        this.startCountdown(); // Start countdown on successful registration
      } catch (error) {
        console.error('Registration failed:', error);
        this.registrationError = 'Registration failed. Please try again.';
      } finally {
        this.isRegistering = false;
      }
    },
    startCountdown() {
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.redirectToLogin();
        }
      }, 1000);
    },
    cancelRedirect() {
      clearInterval(this.timer);
      this.countdown = 10; // Reset countdown
    },
    redirectToLogin() {
      clearInterval(this.timer);
      this.$router.push('/login');
    },
  },
  beforeUnmount() {
    // Clear the interval when the component is destroyed
    this.cancelRedirect();
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 1em auto;
  /* Centered horizontally with margin top and bottom */
  padding: 2em;
  background-color: #f4f4f4;
  /* Light gray background */
  border-radius: 8px;
  /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  /* Soft shadow for depth */
}

.auth-container div {
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="date"],
input[type="tel"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  /* Full width button */
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

.error {
  color: red;
}

.success-message {
  color: green;
  margin-top: 20px;
}

input[type="checkbox"] {
  width: auto;
  margin-top: 5px;
}
</style>
