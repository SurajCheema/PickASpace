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
      bookings: {
        current: [],
        upcoming: [],
        past: []
      },
      activeBookings: [],
      activeType: 'current'
    }
  },
  watch: {
    activeType: {
      immediate: true,
      handler() {
        this.updateActiveBookings();
      }
    }
  },
  created() {
    this.fetchBookings();
  },
  methods: {
    async fetchBookings() {
      try {
        const fetchedBookings = await fetchUserBookings(); // This returns an object with properties current, upcoming, past
        const now = new Date();

        this.bookings.current = this.sortBookingsByStartDate(
          fetchedBookings.current.filter(booking =>
            new Date(booking.startTime) <= now &&
            new Date(booking.endTime) >= now &&
            booking.status !== 'Cancelled'
          )
        );

        this.bookings.upcoming = this.sortBookingsByStartDate(
          fetchedBookings.upcoming.filter(booking =>
            new Date(booking.startTime) > now &&
            booking.status !== 'Cancelled'
          )
        );

        this.bookings.past = this.sortBookingsByStartDate(
          fetchedBookings.past.concat(
            fetchedBookings.current.filter(booking => booking.status === 'Cancelled'),
            fetchedBookings.upcoming.filter(booking => booking.status === 'Cancelled')
          )
        );
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    },
    sortBookingsByStartDate(bookings) {
      return bookings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    },
    updateActiveBookings() {
      this.activeBookings = this.bookings[this.activeType];
    },
    setActive(type) {
      this.activeType = type;
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
