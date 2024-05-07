<template>
  <div class="container mt-5">
    <h1 class="mb-4">Update Profile</h1>
    <form @submit.prevent="submitForm" class="needs-validation" novalidate>
      <div class="mb-3">
        <label for="carRegistration" class="form-label">Car Registration:</label>
        <input type="text" class="form-control" id="carRegistration" v-model="user.car_registration"
          @blur="validateRegistrationPlate" required>
        <div v-if="registrationError" class="invalid-feedback" style="display: block;">{{ registrationError }}</div>
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

      <button type="submit" class="btn btn-primary" :disabled="!isValidForm">Update Profile</button>
    </form>
    <button class="btn btn-secondary mt-3" @click="requestPasswordReset">Reset Password</button>
    <div v-if="message" class="mt-3" :class="{ 'text-success': isSuccess, 'text-danger': !isSuccess }">
      {{ message }}
    </div>
    <div v-if="updateSuccess" class="alert alert-success mt-3">
      Profile successfully updated!
    </div>
  </div>
</template>

<script>
import { getUserDetails, updateUserDetails, requestPasswordReset as requestPasswordResetService } from '../services/userService';
import { fetchVehicleDetails } from '../services/vehicleService';

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
      updateSuccess: false,
      registrationError: '',
      message: '',
      isSuccess: false
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
        this.message = 'Failed to fetch user details.';
        this.isSuccess = false;
      }
    },
    async validateRegistrationPlate() {
      if (!this.user.car_registration.trim()) {
        this.registrationError = "Car registration cannot be empty.";
        return;
      }

      try {
        await fetchVehicleDetails(this.user.car_registration);
        this.registrationError = '';  // Clear any previous error
      } catch (error) {
        this.registrationError = error.message || "Failed to validate car registration.";
        console.error("Registration validation error:", error);
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
    async submitForm() {
      if (this.isValidForm) {
        let updateData = { ...this.user };

        try {
          await updateUserDetails(updateData); 
          this.updateSuccess = true;
          this.message = 'Profile successfully updated!';
          this.isSuccess = true;
          setTimeout(() => { this.updateSuccess = false; }, 3000);
        } catch (error) {
          console.error('Update failed:', error);
          this.message = 'Update failed. Please try again.';
          this.isSuccess = false;
        }
      }
    },
    async requestPasswordReset() {
      try {
        await requestPasswordResetService(this.user.email);
        this.message = 'Please check your email to continue with password reset.';
        this.isSuccess = true;
      } catch (error) {
        console.error('Failed to initiate password reset:', error);
        this.message = 'Failed to send password reset email. Please try again later.';
        this.isSuccess = false;
      }
    }
  },
  computed: {
    isValidForm() {
      return this.isValidEmail(this.user.email) &&
        this.emailConfirm === this.user.email &&
        this.isValidPhone(this.user.phone) &&
        this.user.first_name &&
        this.user.last_name &&
        this.user.DOB;
    }
  }
}
</script>

<style scoped>
.invalid-feedback {
  display: block;
}

.text-success,
.text-danger {
  font-size: 1rem;
}
</style>
