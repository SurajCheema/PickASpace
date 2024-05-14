<template>
  <div class="auth-container">
    <h1 class="blue">Register</h1>
    <form @submit.prevent="registerUser" v-if="!registrationSuccess">
      <div>
        <label for="carRegistration">Car Registration:</label>
        <input type="text" id="carRegistration" v-model="user.car_registration"
          @blur="validateRegistrationPlate" required>
        <p class="error" v-if="registrationError">{{ registrationError }}</p>
      </div>
      <div>
        <label for="firstName">First Name:</label>
        <input type="text" id="firstName" v-model="user.first_name" required>
      </div>
      <div>
        <label for="lastName">Last Name:</label>
        <input type="text" id="lastName" v-model="user.last_name" required>
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="user.email" required>
        <p class="error" v-if="emailError">{{ emailError }}</p>
      </div>
      <div>
        <label for="emailConfirm">Confirm Email:</label>
        <input type="email" id="emailConfirm" v-model="emailConfirm" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="user.password" @input="validatePassword"
          required>
        <p class="error" v-if="passwordError">{{ passwordError }}</p>
      </div>
      <div>
        <label for="passwordConfirm">Confirm Password:</label>
        <input type="password" id="passwordConfirm" v-model="passwordConfirm"
          @input="validatePassword" required>
      </div>
      <div>
        <label for="phone">Phone Number:</label>
        <input type="tel" id="phone" v-model="user.phone" required>
      </div>
      <div>
        <label for="dob">Date of Birth:</label>
        <input type="date" id="dob" v-model="user.DOB" required>
      </div>
      <div>
        <label for="blueBadge">Has Blue Badge:</label>
        <input type="checkbox" id="blueBadge" v-model="user.blueBadge">
      </div>
      <button type="submit" :disabled="isRegistering">
        {{ isRegistering ? 'Registering...' : 'Register' }}
      </button>
    </form>
    <p class="success-message" v-if="registrationSuccess">
      Registration successful! <a href="#" @click="redirectToLogin">Click here</a> to go to the login page.
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
.auth-container {
  max-width: 400px;
  margin: 1em auto; /* Centered horizontally with margin top and bottom */
  padding: 2em;
  background-color: #f4f4f4; /* Light gray background */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
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
  width: 100%; /* Full width button */
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
