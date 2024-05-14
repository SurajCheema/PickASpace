<template>
  <div class="auth-container">
    <h1>Reset Your Password</h1>
    <form @submit.prevent="submitNewPassword" v-if="!isSuccess">
      <div>
        <label for="newPassword">New Password:</label>
        <input type="password" id="newPassword" v-model="newPassword" @input="validatePassword" required
          placeholder="New password">
        <p v-if="passwordError" class="error">{{ passwordError }}</p>
      </div>
      <div>
        <label for="confirmPassword">Confirm New Password:</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" @input="validatePassword" required
          placeholder="Confirm password">
      </div>
      <div v-if="message" :class="{ 'message-success': isSuccess, 'message-error': !isSuccess }">
        {{ message }}
      </div>
      <button type="submit">Reset Password</button>
    </form>
    <div v-if="isSuccess" class="message-success">
      {{ message }}
      <p>You will be redirected to the login page in {{ countDown }} seconds.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { updatePassword, checkNewPassword } from '../services/userService';

const route = useRoute();
const router = useRouter();
const token = route.params.token;
const newPassword = ref('');
const confirmPassword = ref('');
const message = ref('');
const isSuccess = ref(false);
const passwordError = ref('');
const countDown = ref(5);
let countDownTimer = null;

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

    // Start the countdown timer
    countDownTimer = setInterval(() => {
      countDown.value--;
      if (countDown.value === 0) {
        clearInterval(countDownTimer);
        router.push({ name: 'UserLogin' });
      }
    }, 1000);
  } catch (error) {
    message.value = error.message;
    isSuccess.value = false;
  }
}

onUnmounted(() => {
  // Clear the countdown timer when the component is unmounted
  clearInterval(countDownTimer);
});
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
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="password"] {
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

.message-success,
.message-error {
  color: green; /* success message */
  margin-top: 1rem;
}

.message-error {
  color: red; /* error message */
}
</style>