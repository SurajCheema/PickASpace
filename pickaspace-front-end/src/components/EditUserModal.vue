<!-- src/components/EditUserModal.vue -->
<template>
    <div class="modal fade" tabindex="-1" role="dialog" ref="editUserModal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit User</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input type="text" class="form-control" id="firstName" v-model="user.first_name" required>
              </div>
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" class="form-control" id="lastName" v-model="user.last_name" required>
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" class="form-control" id="email" v-model="user.email" required>
              </div>
              <div class="form-group">
                <label for="phone">Phone</label>
                <input type="text" class="form-control" id="phone" v-model="user.phone" required>
              </div>
              <div class="form-group">
                <label for="address">Address</label>
                <input type="text" class="form-control" id="address" v-model="user.address" required>
              </div>
              <div class="form-group">
                <label for="dob">Date of Birth</label>
                <input type="date" class="form-control" id="dob" v-model="user.DOB" required>
              </div>
              <div class="form-group">
                <label for="carRegistration">Car Registration</label>
                <input type="text" class="form-control" id="carRegistration" v-model="user.car_registration">
              </div>
              <div class="form-group">
                <label for="blueBadge">Blue Badge</label>
                <input type="checkbox" id="blueBadge" v-model="user.blueBadge">
              </div>
              <button type="submit" class="btn btn-primary">Save changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['user'],
    methods: {
      saveUser() {
        this.$emit('save-user', this.user);
      }
    }
  };
  </script>
  