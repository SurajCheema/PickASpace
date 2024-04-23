<template>
  <div class="user-booking-logs">
    <div class="text-center mb-4">
      <button class="btn btn-primary mx-2" @click="setActive('current')">Current</button>
      <button class="btn btn-primary mx-2" @click="setActive('upcoming')">Upcoming</button>
      <button class="btn btn-primary mx-2" @click="setActive('past')">Past</button>
    </div>
    <div>
      <booking-list :bookings="activeBookings" />
    </div>
  </div>
</template>

<script>
import BookingList from '../components/BookingList.vue';
import { fetchUserBookings } from '@/services/carParkService';

export default {
  components: {
    BookingList
  },
  data() {
    return {
      currentBookings: [],
      upcomingBookings: [],
      pastBookings: [],
      activeBookings: [],
      activeType: 'current'
    }
  },
  created() {
    this.fetchBookings();
  },
  methods: {
    async fetchBookings() {
      try {
        const bookings = await fetchUserBookings(); // This returns an object with properties current, upcoming, past
        const now = new Date();

        this.currentBookings = bookings.current.filter(booking =>
          new Date(booking.startTime) <= now &&
          new Date(booking.endTime) >= now &&
          booking.status !== 'Cancelled' // Exclude cancelled bookings from current
        );

        this.upcomingBookings = bookings.upcoming.filter(booking =>
          new Date(booking.startTime) > now &&
          booking.status !== 'Cancelled' // Exclude cancelled bookings from upcoming
        );

        this.pastBookings = bookings.past.concat(
          bookings.current.filter(booking =>
            booking.status === 'Cancelled' // Include cancelled bookings as past
          ),
          bookings.upcoming.filter(booking =>
            booking.status === 'Cancelled' // Include cancelled bookings as past
          )
        );

        this.updateActiveBookings();
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    },
    updateActiveBookings() {
      this.activeBookings = this[this.activeType + 'Bookings'];
    },
    setActive(type) {
      this.activeType = type;
      this.updateActiveBookings();
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
