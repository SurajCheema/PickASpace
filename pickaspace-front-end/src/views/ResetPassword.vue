<template>
  <div class="password-reset-container">
    <h1>Reset Your Password</h1>
    <form @submit.prevent="submitNewPassword">
      <div class="form-group">
    <label for="newPassword">New Password:</label>
    <input type="password" id="newPassword" v-model="newPassword" @input="validatePassword" required placeholder="New password">
    <p v-if="passwordError" class="error">{{ passwordError }}</p>
  </div>
  <div class="form-group">
    <label for="confirmPassword">Confirm New Password:</label>
    <input type="password" id="confirmPassword" v-model="confirmPassword" @input="validatePassword" required placeholder="Confirm password">
  </div>
      <div v-if="message" :class="{'message-success': isSuccess, 'message-error': !isSuccess}">
        {{ message }}
      </div>
      <button type="submit" class="reset-button">Reset Password</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { updatePassword, checkNewPassword  } from '../services/userService';

const route = useRoute();
const token = route.params.token;
const newPassword = ref('');
const confirmPassword = ref('');
const message = ref('');
const isSuccess = ref(false);
const passwordError = ref('');

const passwordMismatch = computed(() => newPassword.value !== confirmPassword.value);

async function validatePassword() {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match!';
  } else if (!passwordRegex.test(newPassword.value)) {
    passwordError.value = 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
  } else {
    passwordError.value = '';
  }
}

async function submitNewPassword() {
  if (passwordMismatch.value || passwordError.value) {
    message.value = "Passwords do not match or do not meet the complexity requirements.";
    isSuccess.value = false;
    return;
  }

  try {
    const checkResponse = await checkNewPassword(token, newPassword.value);
    if (checkResponse.error) {
      message.value = checkResponse.error;
      isSuccess.value = false;
      return;
    }

    const response = await updatePassword(token, newPassword.value);
    message.value = response.message || "Password successfully updated.";
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

input[type="password"] {
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

.error, .message-success, .message-error {
  color: red; /* default for error messages */
  margin-top: 1rem;
}

.message-success {
  color: green;
}

.message-error {
  color: red;
}
</style>