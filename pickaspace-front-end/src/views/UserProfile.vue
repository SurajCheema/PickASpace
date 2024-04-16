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
        <label for="emailConfirm" class="form-label">Confirm Email:</label>
        <input type="email" class="form-control" id="emailConfirm" v-model="emailConfirm" required>
        <div v-if="emailConfirm !== user.email" class="invalid-feedback">
          Emails do not match!
        </div>
      </div>
      <div class="mb-3">
        <label for="phone" class="form-label">Phone Number:</label>
        <input type="tel" class="form-control" id="phone" v-model="user.phone" required>
      </div>
      <div class="mb-3">
        <label for="dob" class="form-label">Date of Birth:</label>
        <input type="date" class="form-control" id="dob" v-model="user.DOB" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">New Password (leave blank to keep current):</label>
        <input type="password" class="form-control" id="password" v-model="newPassword">
      </div>
      <div class="mb-3">
        <label for="passwordConfirm" class="form-label">Confirm New Password:</label>
        <input type="password" class="form-control" id="passwordConfirm" v-model="passwordConfirm">
        <div v-if="newPassword !== passwordConfirm" class="invalid-feedback">
          Passwords do not match!
        </div>
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
      emailConfirm: '',
      newPassword: '',
      passwordConfirm: '',
      updateSuccess: false,
      emailError: '',
      passwordError: ''    
    };
  },
  created() {
    this.fetchUserDetails();
  },
  methods: {
    async fetchUserDetails() {
      try {
        const details = await getUserDetails();
        this.user = { ...details, DOB: this.formatDate(details.DOB) };
        this.emailConfirm = this.user.email;
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }  
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      let month = '' + (date.getMonth() + 1),
          day = '' + date.getDate(),
          year = date.getFullYear();

      if (month.length < 2) 
          month = '0' + month;
      if (day.length < 2) 
          day = '0' + day;

      return [year, month, day].join('-');
    },

    async updateProfile() {
      if (this.newPassword !== this.passwordConfirm) {
        this.passwordError = 'Passwords do not match!';
        return;
      }
      if (this.user.email !== this.emailConfirm) {
        this.emailError = 'Emails do not match!';
        return;
      }
      if (this.newPassword) {
        this.user.password = this.newPassword; // Set the new password only if provided
      }
      try {
        await updateUserDetails(this.user);
        this.updateSuccess = true;
        setTimeout(() => {
          this.updateSuccess = false;
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
