<!-- src/views/AdminManageUsers.vue -->
<template>
    <div class="container mt-4">
      <h2 class="mb-4">Manage Users</h2>
      <div v-if="loading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div v-else>
        <div v-if="users.length">
          <div class="list-group">
            <div
              v-for="user in users"
              :key="user.user_id"
              class="list-group-item list-group-item-action flex-column align-items-start"
            >
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">{{ user.first_name }} {{ user.last_name }}</h5>
                <small>{{ user.email }}</small>
              </div>
              <p class="mb-1">{{ user.phone }}</p>
              <div class="btn-group mt-2" role="group" aria-label="User Actions">
                <button class="btn btn-primary" @click="navigateToEditUser(user.user_id)">Edit</button>
                <button class="btn btn-warning" @click="softDeleteUser(user.user_id)">Delete</button>
                <button class="btn btn-danger" @click="forceDeleteUser(user.user_id)">Force Delete</button>
                <button class="btn btn-secondary" @click="sendPasswordReset(user.email)">Reset Password</button>
              </div>
            </div>
          </div>
        </div>
        <p v-if="message" class="mt-3" :class="{ 'text-success': isSuccess, 'text-danger': !isSuccess }">{{ message }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import { fetchAllUsers, updateUserByAdmin, softDeleteUser, forceDeleteUser, requestPasswordReset } from '@/services/userService';
  
  export default {
    data() {
      return {
        loading: true,
        users: [],
        message: '',
        isSuccess: false,
        selectedUser: null,
        showModal: false,
      };
    },
    async created() {
      await this.loadUsers();
    },
    methods: {
      async loadUsers() {
        try {
          this.loading = true;
          const users = await fetchAllUsers();
          this.users = users;
        } catch (error) {
          this.message = 'Failed to load users.';
          this.isSuccess = false;
          console.error('Error loading users:', error);
        } finally {
          this.loading = false;
        }
      },
      async saveUser() {
        try {
          await updateUserByAdmin(this.selectedUser.user_id, this.selectedUser);
          this.message = 'User updated successfully.';
          this.isSuccess = true;
          this.showModal = false;
          await this.loadUsers();
        } catch (error) {
          this.message = 'Failed to update user.';
          this.isSuccess = false;
          console.error('Error updating user:', error);
        }
      },
      async softDeleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
          try {
            await softDeleteUser(userId);
            this.message = 'User soft deleted successfully.';
            this.isSuccess = true;
            await this.loadUsers();
          } catch (error) {
            this.message = 'Failed to soft delete user.';
            this.isSuccess = false;
            console.error('Error soft deleting user:', error);
          }
        }
      },
      async forceDeleteUser(userId) {
        if (confirm('Are you sure you want to permanently delete this user?')) {
          try {
            await forceDeleteUser(userId);
            this.message = 'User permanently deleted successfully.';
            this.isSuccess = true;
            await this.loadUsers();
          } catch (error) {
            this.message = 'Failed to permanently delete user.';
            this.isSuccess = false;
            console.error('Error force deleting user:', error);
          }
        }
      },
      async sendPasswordReset(email) {
        try {
          await requestPasswordReset(email);
          this.message = 'Password reset link sent.';
          this.isSuccess = true;
        } catch (error) {
          this.message = 'Failed to send password reset link.';
          this.isSuccess = false;
          console.error('Error sending password reset link:', error);
        }
      },
      navigateToEditUser(userId) {
      this.$router.push({ name: 'AdminEditUser', params: { userId: userId } });
    },
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f4f4f4;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
  
  .list-group-item {
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .list-group-item h5 {
    font-size: 1.25rem;
  }
  
  .spinner-border {
    width: 3rem;
    height: 3rem;
  }
  
  .modal-content {
    border-radius: 0.5rem;
  }
  
  .btn-group .btn {
    margin-right: 0.5rem;
  }
  
  .alert {
    width: 100%;
    text-align: center;
  }
  </style>
  