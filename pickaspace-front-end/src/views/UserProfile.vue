<template>
  <div class="container mt-5">
    <h1 class="mb-4">Update Profile</h1>
    <form @submit.prevent="updateProfile" class="needs-validation" novalidate>
      <div class="mb-3">
        <label for="carRegistration" class="form-label">Car Registration:</label>
        <input type="text" class="form-control" id="carRegistration" v-model="user.car_registration" required>
      </div>
      <div class="mb-3">
        <label for="firstName" class="form-label">First Name:</label>
        <input type="text" class="form-control" id="firstName" v-model="user.first_name" required>
      </div>
      <div class="mb-3">
        <label for="lastName" class="form-label">Last Name:</label>
        <input type="text" class="form-control" id="lastName" v-model="user.last_name" required>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email:</label>
        <input type="email" class="form-control" id="email" v-model="user.email" required>
        <div v-if="emailError" class="invalid-feedback">{{ emailError }}</div>
      </div>
      <div class="mb-3">
        <label for="phone" class="form-label">Phone Number:</label>
        <input type="tel" class="form-control" id="phone" v-model="user.phone" required>
      </div>
      <div class="mb-3">
        <label for="dob" class="form-label">Date of Birth:</label>
        <input type="date" class="form-control" id="dob" v-model="user.DOB" required>
      </div>
      <button type="submit" class="btn btn-primary">Update Profile</button>
    </form>
    <div v-if="updateSuccess" class="alert alert-success mt-3">
      Profile successfully updated!
    </div>
  </div>
</template>

<script>
import { getUserDetails, updateUserDetails } from '../services/userService';

export default {
  name: 'UserProfile',
  data() {
    return {
      user: {
        car_registration: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        DOB: ''
      },
      emailError: '',
      passwordError: '',
      updateSuccess: false
    };
  },
  created() {
    this.fetchUserDetails();
  },
  methods: {
    async fetchUserDetails() {
    try {
      const details = await getUserDetails();
      this.user = { ...details };
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  },

  async updateProfile() {
    if (this.emailError || this.passwordError) {
      console.error('Validation failed:', this.emailError, this.passwordError);
      return; // Stop execution if there are form errors
    }
    try {
      await updateUserDetails(this.user);
      this.updateSuccess = true;
      setTimeout(() => {
        this.updateSuccess = false; // Reset the success state after 3000ms
      }, 3000);
    } catch (error) {
      console.error('Update failed:', error);
    }
  }
 }
}
</script>

<style scoped>
.invalid-feedback {
  display: block; 
}
</style>
