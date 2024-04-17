<template>
  <div class="container mt-5">
    <h1>User Bookings</h1>
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a class="nav-link active" href="#" @click="setActiveTab('upcoming')">Upcoming</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#" @click="setActiveTab('in_progress')">In Progress</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#" @click="setActiveTab('past')">Past</a>
      </li>
    </ul>

    <div v-if="activeTab === 'upcoming'">
      <!-- Display upcoming bookings -->
      <div v-for="booking in bookings.upcoming" :key="booking.id" class="card my-2">
        <div class="card-body">
          <h5 class="card-title">Booking at {{ booking.location }}</h5>
          <p class="card-text">From {{ booking.start_time }} to {{ booking.end_time }}</p>
          <a href="#" class="btn btn-primary" @click="modifyBooking(booking)">Modify</a>
          <a href="#" class="btn btn-danger" @click="cancelBooking(booking)">Cancel</a>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'in_progress'">
      <!-- Display in-progress bookings -->
      <div v-for="booking in bookings.in_progress" :key="booking.id" class="card my-2">
        <div class="card-body">
          <h5 class="card-title">Booking at {{ booking.location }}</h5>
          <p class="card-text">Ends at {{ booking.end_time }}</p>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'past'">
      <!-- Display past bookings -->
      <div v-for="booking in bookings.past" :key="booking.id" class="card my-2">
        <div class="card-body">
          <h5 class="card-title">Booking at {{ booking.location }}</h5>
          <p class="card-text">From {{ booking.start_time }} to {{ booking.end_time }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchCarParkDetails } from '../services/carParkService';

export default {
  name: 'UserBookingLogs',
  data() {
    return {
      activeTab: 'upcoming',
      bookings: {
        upcoming: [],
        in_progress: [],
        past: []
      }
    };
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    fetchBookings() {
      // Placeholder for fetching bookings data
      // This method should interact with carParkService to get the bookings
    },
    modifyBooking(booking) {
      // Handle booking modification
    },
    cancelBooking(booking) {
      // Handle booking cancellation
    }
  },
  created() {
    this.fetchBookings();
  }
}
</script>

<style scoped>
.nav-link.active {
  background-color: #007bff;
  color: white;
}
</style>
