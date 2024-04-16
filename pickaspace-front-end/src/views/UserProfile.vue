<template>
  <div class="container mt-5">
    <h1 class="mb-4">Update Profile</h1>
    <form @submit.prevent="updateProfile" class="needs-validation" novalidate>
      <div class="mb-3" :class="{'was-validated': submitted && !user.car_registration}">
        <label for="carRegistration" class="form-label">Car Registration:</label>
        <input type="text" class="form-control" id="carRegistration" v-model="user.car_registration" required>
        <div class="invalid-feedback" v-if="submitted && !user.car_registration">
          Car registration is required.
        </div>
      </div>
      <div class="mb-3" :class="{'was-validated': submitted && !user.first_name}">
        <label for="firstName" class="form-label">First Name:</label>
        <input type="text" class="form-control" id="firstName" v-model="user.first_name" required>
        <div class="invalid-feedback" v-if="submitted && !user.first_name">
          First name is required.
        </div>
      </div>
      <div class="mb-3" :class="{'was-validated': submitted && !user.last_name}">
        <label for="lastName" class="form-label">Last Name:</label>
        <input type="text" class="form-control" id="lastName" v-model="user.last_name" required>
        <div class="invalid-feedback" v-if="submitted && !user.last_name">
          Last name is required.
        </div>
      </div>
      <div class="mb-3" :class="{'was-validated': submitted && !isValidEmail(user.email)}">
        <label for="email" class="form-label">Email:</label>
        <input type="email" class="form-control" id="email" v-model="user.email" required :pattern="emailPattern">
        <div v-if="submitted && !isValidEmail(user.email)" class="invalid-feedback">
          Please enter a valid email address.
        </div>
      </div>
      <div class="mb-3" :class="{'was-validated': submitted && (emailConfirm !== user.email || !isValidEmail(emailConfirm))}">
        <label for="emailConfirm" class="form-label">Confirm Email:</label>
        <input type="email" class="form-control" id="emailConfirm" v-model="emailConfirm" required :pattern="emailPattern">
        <div class="invalid-feedback">
          <span v-if="emailConfirm !== user.email">Emails must match!</span>
          <span v-if="!isValidEmail(emailConfirm)">Please enter a valid email address.</span>
        </div>
      </div>      <div class="mb-3" :class="{'was-validated': submitted && !user.phone}">
        <label for="phone" class="form-label">Phone Number:</label>
        <input type="tel" class="form-control" id="phone" v-model="user.phone" required>
        <div class="invalid-feedback" v-if="submitted && !user.phone">
          Phone number is required.
        </div>
      </div>
      <div class="mb-3" :class="{'was-validated': submitted && !user.DOB}">
        <label for="dob" class="form-label">Date of Birth:</label>
        <input type="date" class="form-control" id="dob" v-model="user.DOB" required>
        <div class="invalid-feedback" v-if="submitted && !user.DOB">
          Date of birth is required.
        </div>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">New Password (leave blank to keep current):</label>
        <input type="password" class="form-control" id="password" v-model="newPassword">
      </div>
      <div class="mb-3">
        <label for="passwordConfirm" class="form-label">Confirm New Password:</label>
        <input type="password" class="form-control" id="passwordConfirm" v-model="passwordConfirm">
        <div v-if="newPassword && newPassword !== passwordConfirm" class="invalid-feedback">
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
      passwordError: '',
      submitted: false,
      emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    };
  },
  created() {
    this.fetchUserDetails();
  },
  methods: {
    async fetchUserDetails() {
      try {
        const details = await getUserDetails();
        if (details) {
          this.user = { ...this.user, ...details };
          this.user.DOB = this.formatDate(details.DOB); 
          this.emailConfirm = this.user.email;
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    },

      formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const year = date.getFullYear();
      let month = ('0' + (date.getMonth() + 1)).slice(-2);  // Ensures two digits
      let day = ('0' + date.getDate()).slice(-2);           // Ensures two digits
      return `${year}-${month}-${day}`;  // Correct format for HTML date input
    },

    isValidEmail(email) {
      return this.emailPattern.test(email);
    },

    async updateProfile() {
      this.submitted = true;  // Indicate that the form has been submitted for validation
      if (!this.isValidForm) return;  // Prevent submission if validation fails

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
  },
  computed: {
    isValidForm() {
      return this.isValidEmail(this.user.email) &&
             this.user.first_name &&
             this.user.last_name &&
             this.user.phone &&
             this.user.DOB &&
             this.isValidEmail(this.emailConfirm) &&
             this.emailConfirm === this.user.email;
    }
  }
}
</script>

<style scoped>
.invalid-feedback {
  display: block; 
}
</style>
