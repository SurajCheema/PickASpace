<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <div class="button-group">
      <b-button variant="success" @click="goToRefunds">Manage Refunds</b-button>
      <b-button variant="success" @click="goToCarParks">Manage Car Parks</b-button>
      <b-button variant="success" @click="goToUsers">Manage Users</b-button>
    </div>
  </div>
</template>

<script>
import { BButton } from 'bootstrap-vue-next';

export default {
  name: 'AdminDashboard',
  components: {
    BButton
  },
  methods: {
    goToRefunds() {
      this.$router.push({ name: 'AdminRefundManagement' });
    },
    goToCarParks() {
      this.$router.push({ name: 'AdminManageCarParks' });
    },
    goToUsers() {
      this.$router.push({ name: 'AdminManageUsers' });
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.admin-dashboard h1 {
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px; /* Add spacing between the buttons */
}

.button-group b-button {
  flex: 1 1 auto;
  min-width: 150px; /* Ensure buttons are of same size */
  margin: 5px;
}

@media (min-width: 768px) {
  .button-group {
    justify-content: space-between;
    max-width: 600px;
  }
}
</style>
