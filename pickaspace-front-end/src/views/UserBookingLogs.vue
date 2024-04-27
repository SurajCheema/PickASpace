<template>
  <div class="user-booking-logs">
    <div class="text-center mb-4">
      <button class="btn btn-primary mx-2" @click="setActive('current')">Current</button>
      <button class="btn btn-primary mx-2" @click="setActive('upcoming')">Upcoming</button>
      <button class="btn btn-primary mx-2" @click="setActive('past')">Past</button>
    </div>
    <div>
      <booking-list :bookings="activeBookings" @view-details="showBookingDetailsModal" />
      <booking-details-modal ref="bookingModal" v-if="isBookingDetailsModalVisible" :booking="bookingDetails"
        @close="isBookingDetailsModalVisible = false" />
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
      activeType: 'current',
      isBookingDetailsModalVisible: false,
      bookingDetails: null
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

  computed: {
  filteredBookings() {
    return this.bookings[this.activeType];
  }
},

  methods: {
    async fetchBookings() {
  try {
    this.isFetching = true;
    const fetchedBookings = await fetchUserBookings();
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
      ),
      true
    );

  } catch (error) {
    console.error('Error fetching bookings:', error);
  } finally {
    this.isFetching = false;
  }
},
    sortBookingsByStartDate(bookings, isPast = false) {
      if (isPast) {
        // Sort by startTime in descending order for past bookings
        return bookings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      }
      // Default sorting for current and upcoming
      return bookings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    },
    updateActiveBookings() {
  this.activeBookings = this.filteredBookings;
},
    setActive(type) {
      this.activeType = type;
    },
    showBookingDetailsModal(booking) {
      this.bookingDetails = booking;
      this.isBookingDetailsModalVisible = true;
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
