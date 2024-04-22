<template>
  <div class="user-booking-logs">
    <b-tabs content-class="mt-3">
      <b-tab title="Current" active>
        <booking-list :bookings="currentBookings" />
      </b-tab>
      <b-tab title="Upcoming">
        <booking-list :bookings="upcomingBookings" />
      </b-tab>
      <b-tab title="Past">
        <booking-list :bookings="pastBookings" />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import BookingList from '../components/BookingList.vue'

export default {
  components: {
    BookingList
  },
  data() {
    return {
      currentBookings: [],
      upcomingBookings: [],
      pastBookings: []
    }
  },
  created() {
    // Here you would fetch the data from the backend
    this.currentBookings = this.fetchBookings('current');
    this.upcomingBookings = this.fetchBookings('upcoming');
    this.pastBookings = this.fetchBookings('past');
  },
  methods: {
    fetchBookings(type) {
      // This function will eventually make HTTP requests to fetch data
      // Returning mock data for now
      return [{ id: 1, summary: 'Booking 1', date: '2024-04-20' }];
    }
  }
}
</script>

<style>
.user-booking-logs {
  max-width: 800px;
  margin: auto;
}
</style>
