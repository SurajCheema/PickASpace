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
  background-color: #f4f4f4;
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
  transition: background-color 0.3s, color 0.3s, transform 0.3s; /* Smooth transition for hover effects */
  border: none; /* Remove default borders */
  border-radius: 5px; /* Rounded corners for a softer look */
  color: white; /* Ensure text is white for better readability */
  font-weight: bold; /* Make the text bold */
}

/* Blue background for Profile, Payment Logs, Booking Logs, and Manage Car Parks buttons */
.dashboard-buttons .btn-info,
.dashboard-buttons .btn-success {
  background-color: #6495ed; /* Blue color matching the navbar */
}

.dashboard-buttons .btn-warning {
  background-color: #ffc107; /* Gold color */
}

/* Hover effects */
.dashboard-buttons .btn-info:hover,
.dashboard-buttons .btn-success:hover {
  background-color: white; /* White background on hover */
  color: #6495ed; /* Blue text on hover */
  transform: scale(1.05); /* Slightly enlarge the button */
}

.dashboard-buttons .btn-warning:hover {
  background-color: white; /* White background on hover */
  color: #ffc107; /* Gold text on hover */
  transform: scale(1.05); /* Slightly enlarge the button */
}

/* Focus effects for accessibility */
.dashboard-buttons .btn:focus {
  outline: none; /* Remove default focus outline */
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); /* Custom focus shadow */
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
