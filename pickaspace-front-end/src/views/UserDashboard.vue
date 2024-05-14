<template>
  <div class="user-dashboard">
    <h1><span class="blue">User</span> Dashboard</h1>
    <p>Welcome to your dashboard! Manage your profile, view payments and bookings.</p>

    <div class="dashboard-buttons">
      <router-link to="/user/profile" class="dashboard-link">
        <button type="button" class="btn btn-info">Profile</button>
      </router-link>
      <router-link to="/user/payments" class="dashboard-link">
        <button type="button" class="btn btn-info">Payment Logs</button>
      </router-link>
      <router-link to="/user/bookings" class="dashboard-link">
        <button type="button" class="btn btn-success">Booking Logs</button>
      </router-link>
      <router-link to="/user/carparks" class="dashboard-link">
        <button type="button" class="btn btn-success">Manage Car Parks</button>
      </router-link>
      <router-link to="/user/earnings" class="dashboard-link earnings">
        <button type="button" class="btn btn-warning">View Earnings</button>
      </router-link>
    </div>
  </div>
</template>


<script>

export default {
  data() {
    return {
      stripeStatus: null,
    };
  },
  created() {
  },
  methods: {
  }
}
</script>

<style>
.user-dashboard {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  text-align: center;
  background-color: #f4f4f4; /* Matching the light gray from login */
}

.dashboard-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns for the main buttons */
  gap: 20px;
  margin-top: 20px;
}

.dashboard-link.earnings {
  grid-column: 1 / -1; /* Span across all available columns */
  justify-self: center; /* Center the button within the span */
}

.dashboard-buttons .btn {
  width: 100%; /* Full width buttons for better touch targets */
  padding: 10px; /* Larger click area */
}

.dashboard-link {
  text-decoration: none;
}

.alert {
  padding: 10px;
  border-radius: 5px;
  color: #fff;
}

.alert-success { background-color: #28a745; }
.alert-warning { background-color: #ffc107; }
.alert-danger { background-color: #dc3545; }
.alert-info { background-color: #17a2b8; }

@media (min-width: 992px) {
  .user-dashboard { width: 50%; /* 50% width on large screens */ }
}

@media (min-width: 768px) and (max-width: 991px) {
  .user-dashboard { width: 60%; /* 60% width on normal screens */ }
}

@media (max-width: 767px) {
  .user-dashboard { width: 100%; /* Full width on small screens */ }
}
</style>
