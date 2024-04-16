<template>
  <div class="container mt-5">
    <h1 class="mb-4">Update Profile</h1>
    <form @submit.prevent="submitForm" class="needs-validation" novalidate>
      <div class="mb-3">
        <label for="carRegistration" class="form-label">Car Registration:</label>
        <input type="text" class="form-control" id="carRegistration" v-model="user.car_registration" required>
        <div class="invalid-feedback" v-show="!user.car_registration">
          Car registration is required.
        </div>
      </div>
      
      <div class="mb-3">
        <label for="firstName" class="form-label">First Name:</label>
        <input type="text" class="form-control" id="firstName" v-model="user.first_name" required>
        <div class="invalid-feedback" v-show="!user.first_name">
          First name is required.
        </div>
      </div>

      <div class="mb-3">
        <label for="lastName" class="form-label">Last Name:</label>
        <input type="text" class="form-control" id="lastName" v-model="user.last_name" required>
        <div class="invalid-feedback" v-show="!user.last_name">
          Last name is required.
        </div>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email:</label>
        <input type="email" class="form-control" id="email" v-model="user.email" required>
        <div class="invalid-feedback" v-show="!isValidEmail(user.email)">
          Please enter a valid email address.
        </div>
      </div>

      <div class="mb-3">
        <label for="emailConfirm" class="form-label">Confirm Email:</label>
        <input type="email" class="form-control" id="emailConfirm" v-model="emailConfirm" required>
        <div class="invalid-feedback" v-show="emailConfirm !== user.email">
          Emails must match!
        </div>
      </div>

      <div class="mb-3">
        <label for="phone" class="form-label">Phone Number:</label>
        <input type="tel" class="form-control" id="phone" v-model="user.phone" required>
        <div class="invalid-feedback" v-show="!isValidPhone(user.phone)">
          Please enter a valid international phone number.
        </div>
      </div>

      <div class="mb-3">
        <label for="dob" class="form-label">Date of Birth:</label>
        <input type="date" class="form-control" id="dob" v-model="user.DOB" required>
        <div class="invalid-feedback" v-show="!user.DOB">
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
        <div class="invalid-feedback" v-show="newPassword && newPassword !== passwordConfirm">
          Passwords do not match!
        </div>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="!isValidForm">Update Profile</button>
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
        this.user = { ...this.user, ...details };
        this.user.DOB = this.formatDate(details.DOB);
        this.emailConfirm = this.user.email;
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    },
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    isValidPhone(phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      return phoneRegex.test(phone);
    },
    submitForm() {
      if (this.isValidForm) {
        let updateData = { ...this.user };
        // Check if new password is provided and matches the confirmation before updating
        if (this.newPassword && this.newPassword === this.passwordConfirm) {
          updateData.password = this.newPassword;
        } else {
          delete updateData.password; // Prevents password field from being included if not intended
        }
        updateUserDetails(updateData).then(() => {
          this.updateSuccess = true;
          setTimeout(() => this.updateSuccess = false, 3000);
        }).catch(error => console.error('Update failed:', error));
      }''
    }
  },
  computed: {
    isValidForm() {
      return this.isValidEmail(this.user.email) &&
             this.emailConfirm === this.user.email &&
             this.isValidPhone(this.user.phone) &&
             this.user.first_name &&
             this.user.last_name &&
             this.user.DOB && 
             (this.newPassword === this.passwordConfirm || (this.newPassword === '' && this.passwordConfirm === ''));
    }
  }
}
</script>

<style scoped>
.invalid-feedback {
  display: block;
}
</style>
