<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <div class="dashboard-buttons">
      <router-link to="/admin/refunds" class="dashboard-link">
        <button type="button" class="btn btn-success">Manage Refunds</button>
      </router-link>
      <router-link to="/admin/carparks" class="dashboard-link">
        <button type="button" class="btn btn-success">Manage Car Parks</button>
      </router-link>
      <router-link to="/admin/users" class="dashboard-link center-button">
        <button type="button" class="btn btn-success">Manage Users</button>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
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
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  text-align: center;
  background-color: #f4f4f4;
}

.dashboard-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns for the main buttons */
  gap: 20px;
  margin-top: 20px;
}

.dashboard-link {
  text-decoration: none;
}

.dashboard-link.center-button {
  grid-column: 1 / -1; /* Span across all available columns */
  justify-self: center; /* Center the button within the span */
}

.dashboard-buttons .btn {
  width: 100%; /* Full width buttons for better touch targets */
  padding: 10px; /* Larger click area */
  transition: background-color 0.3s, color 0.3s, transform 0.3s; /* Smooth transition for hover effects */
  border: none; /* Remove default borders */
  border-radius: 5px; /* Rounded corners for a softer look */
  color: white; /* Ensure text is white for better readability */
  font-weight: bold; /* Make the text bold */
}

.dashboard-buttons .btn-success {
  background-color: #6495ed; /* Blue color matching the navbar */
}

/* Hover effects */
.dashboard-buttons .btn-success:hover {
  background-color: white; /* White background on hover */
  color: #6495ed; /* Blue text on hover */
  transform: scale(1.05); /* Slightly enlarge the button */
}

/* Focus effects for accessibility */
.dashboard-buttons .btn:focus {
  outline: none; /* Remove default focus outline */
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); /* Custom focus shadow */
}
</style>
