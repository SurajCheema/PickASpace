<template>
  <div class="auth-container">
    <h1>Reset Your Password</h1>
    <form @submit.prevent="requestPasswordResetForm">
      <div>
        <label for="email">Enter your email:</label>
        <input type="email" id="email" v-model="email" required placeholder="Your email">
        <p class="error" v-if="message && !isSuccess">{{ message }}</p>
      </div>
      <div v-if="message" :class="{'message-success': isSuccess, 'message-error': !isSuccess}">
        {{ message }}
      </div>
      <button type="submit">Send Reset Link</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { requestPasswordReset } from '../services/userService';

const email = ref('');
const message = ref('');
const isSuccess = ref(false);

async function requestPasswordResetForm() {
  try {
    console.log("FRONTEND RESET PASSWORD");
    const response = await requestPasswordReset(email.value);
    message.value = response.message || 'If the email is registered, you will receive a password reset link.';
    isSuccess.value = true;
  } catch (error) {
    message.value = error.message;
    isSuccess.value = false;
  }
}
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

div {
  margin-bottom: 10px;
  width: 100%; /* Full width within the container */
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="email"] {
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

.message-success, .message-error {
  color: green;
  margin-top: 1rem;
}

.message-error {
  color: red;
}
</style>
