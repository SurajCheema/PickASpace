<template>
  <div id="login-div" class="auth-container">
    <h1>Login</h1>
    <form @submit.prevent="loginUser">
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="user.email" required>
        <p class="error" v-if="emailError">{{ emailError }}</p>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="user.password" required>
      </div>
      <p class="error" v-if="loginError">{{ loginError }}</p>
      <div>
        <a href="/user/requestpasswordreset" class="password-reset-link">Forgot Password?</a>
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import { loginUser } from '../services/userService';

export default {
  name: 'UserLogin',
  data() {
    return {
      user: {
        email: '',
        password: ''
      },
      loginError: '',
      emailError: ''
    };
  },
  methods: {
    async loginUser() {
      if (!this.isValidEmail(this.user.email)) {
        this.emailError = "Please enter a valid email address.";
        return;
      }
      this.emailError = ''; // Reset email error
      try {
        await loginUser(this.user);
        console.log('User logged in');
        this.$router.push('/dashboard');
      } catch (error) {
        console.error('Login failed:', error);
        this.loginError = 'Login failed: Invalid email or password.';
      }
    },
    isValidEmail(email) {
      // eslint-disable-next-line no-useless-escape
      const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; // Email regex pattern
      return pattern.test(email);
    }
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 6em 20px 20px 20px;
  /* top right bottom down */
}

.auth-container div {
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="email"],
input[type="password"] {
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

.error {
  color: red;
}

.password-reset-link {
  display: block;
  margin-top: 10px;
  font-size: 0.9em;
  color: #0066cc;
  cursor: pointer;
  text-decoration: none;
}

.password-reset-link:hover {
  text-decoration: underline;
}
</style>