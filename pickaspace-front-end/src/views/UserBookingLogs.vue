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
        this.isFetching = true;  // Indicate that data is being fetched
        const fetchedBookings = await fetchUserBookings();
        const now = new Date();

        const newCurrentBookings = this.sortBookingsByStartDate(
          fetchedBookings.current.filter(booking =>
            new Date(booking.startTime) <= now &&
            new Date(booking.endTime) >= now &&
            booking.status !== 'Cancelled'
          )
        );

        const newUpcomingBookings = this.sortBookingsByStartDate(
          fetchedBookings.upcoming.filter(booking =>
            new Date(booking.startTime) > now &&
            booking.status !== 'Cancelled'
          )
        );

        const newPastBookings = this.sortBookingsByStartDate(
          fetchedBookings.past.concat(
            fetchedBookings.current.filter(booking => booking.status === 'Cancelled'),
            fetchedBookings.upcoming.filter(booking => booking.status === 'Cancelled')
          )
        );

        // Only update state if it has actually changed
        if (JSON.stringify(this.bookings.current) !== JSON.stringify(newCurrentBookings)) {
          this.bookings.current = newCurrentBookings;
        }
        if (JSON.stringify(this.bookings.upcoming) !== JSON.stringify(newUpcomingBookings)) {
          this.bookings.upcoming = newUpcomingBookings;
        }
        if (JSON.stringify(this.bookings.past) !== JSON.stringify(newPastBookings)) {
          this.bookings.past = newPastBookings;
        }

      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        this.isFetching = false;  // Reset fetching indicator
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
