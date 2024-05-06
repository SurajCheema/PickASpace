<template>
  <div class="password-reset-container">
    <h1>Reset Your Password</h1>
    <form @submit.prevent="requestPasswordResetForm">
      <div class="form-group">
        <label for="email">Enter your email:</label>
        <input type="email" id="email" v-model="email" required placeholder="Your email">
      </div>
      <div v-if="message" :class="{'message-success': isSuccess, 'message-error': !isSuccess}">
        {{ message }}
      </div>
      <button type="submit" class="reset-button">Send Reset Link</button>
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

.message-success {
  color: green;
  margin-top: 1rem;
}

.message-error {
  color: red;
  margin-top: 1rem;
}
</style>
