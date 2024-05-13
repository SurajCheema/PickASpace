<template>
  <div class="user-booking-logs">
    <div class="text-center mb-4 button-group">
      <button class="btn mx-2" @click="setActive('current')">Current</button>
      <button class="btn mx-2" @click="setActive('upcoming')">Upcoming</button>
      <button class="btn mx-2" @click="setActive('past')">Past</button>
      <button class="btn mx-2" @click="setActive('cancelled')">Cancelled</button>
    </div>
    <div>
      <booking-list :bookings="activeBookings" @booking-selected="showBookingDetailsModal"
        @booking-cancelled="handleBookingCancelled" />
      <booking-details-modal v-if="isBookingDetailsModalVisible" :booking="bookingDetails"
        :show-view-payment-button="true" @close="closeBookingDetailsModal" @view-payment="showPaymentDetailsModal"
        @booking-cancelled="handleBookingCancelled" />
      <payment-details-modal v-if="isPaymentDetailsModalVisible" :payment="selectedPayment"
        @close="closePaymentDetailsModal" />
    </div>
  </div>
</template>

<script>
import BookingList from '../components/BookingList.vue';
import BookingDetailsModal from '../components/BookingDetailsModal.vue';
import PaymentDetailsModal from '../components/PaymentDetailsModal.vue';
import { fetchUserBookings, cancelBooking as cancelBookingService, fetchBookingById } from '@/services/carParkService';
import { fetchPaymentById } from '@/services/paymentService';

export default {
  components: {
    BookingList,
    BookingDetailsModal,
    PaymentDetailsModal
  },
  data() {
    return {
      bookings: {
        current: [],
        upcoming: [],
        past: [],
        cancelled: []
      },
      activeBookings: [],
      activeType: 'current',
      isBookingDetailsModalVisible: false,
      bookingDetails: null,
      isPaymentDetailsModalVisible: false,
      selectedPayment: null
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
        console.log("Fetched Bookings:", fetchedBookings); // Log the fetched bookings to inspect their structure
        this.processBookings(fetchedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        this.isFetching = false;
      }
    },

    processBookings(data) {
      const now = new Date();
      if (!data) return; // Add a guard clause to handle null or undefined data

      const { current, upcoming, past } = data;

      this.bookings.current = (current || []).filter(b => new Date(b.startTime) <= now && new Date(b.endTime) >= now && b.status !== 'cancelled');
      this.bookings.upcoming = (upcoming || []).filter(b => new Date(b.startTime) > now && b.status !== 'cancelled');
      this.bookings.past = (past || []).filter(b => new Date(b.endTime) < now && b.status !== 'cancelled');
      this.bookings.cancelled = [...current, ...upcoming, ...past].filter(b => b.status === 'cancelled');

      this.updateActiveBookings();
    },

    updateActiveBookings() {
      this.activeBookings = this.filteredBookings;
    },
    setActive(type) {
      this.activeType = type;
      this.updateActiveBookings();
    },
    async showBookingDetailsModal(booking) {
      try {
        const bookingDetails = await fetchBookingById(booking.log_id);
        this.bookingDetails = bookingDetails;
        this.isBookingDetailsModalVisible = true;
      } catch (error) {
        console.error('Error fetching booking details:', error);
        alert('Failed to fetch booking details: ' + error.message);
      }
    },
    closeBookingDetailsModal() {
      this.isBookingDetailsModalVisible = false;
    },
    async showPaymentDetailsModal(paymentId) {
      try {
        this.selectedPayment = await fetchPaymentById(paymentId);
        this.isPaymentDetailsModalVisible = true;
      } catch (error) {
        console.error('Error fetching payment details:', error);
      }
    },
    closePaymentDetailsModal() {
      this.selectedPayment = null;
      this.isPaymentDetailsModalVisible = false;
    },
    async cancelBooking(bookingId) {
      try {
        const cancelledBooking = await cancelBookingService(bookingId);
        this.handleBookingCancelled(cancelledBooking);
      } catch (error) {
        console.error('Error cancelling booking:', error);
      }
    },
    handleBookingCancelled(cancelledBooking) {
      const bookingType = this.getBookingType(cancelledBooking);
      const index = this.bookings[bookingType].findIndex(b => b.log_id === cancelledBooking.log_id);
      if (index !== -1) {
        this.bookings[bookingType].splice(index, 1);
        this.bookings.cancelled.unshift(cancelledBooking);
        this.updateActiveBookings();
      }
    },
    getBookingType(booking) {
      const now = new Date();
      if (new Date(booking.startTime) > now) return 'upcoming';
      if (new Date(booking.endTime) < now) return 'past';
      return 'current';
    }
  }
}
</script>

<style scoped>
.user-booking-logs {
  display: block; /* Ensures the div behaves as a block-level element */
  width: 100%; /* Full width for small screens */
  padding: 20px;
  margin: auto; /* Centers the div horizontally */
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  background: #f8f9fa;
}

@media (min-width: 768px) { /* Medium screens and up */
  .user-booking-logs {
    width: 70%; /* 70% width for medium screens */
  }
}

@media (min-width: 992px) { /* Large screens and up */
  .user-booking-logs {
    width: 60%; /* 60% width for large screens */
  }
}

.booking-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr); /* Single column layout by default */
  gap: 20px; /* Spacing between grid items */
}

@media (min-width: 992px) { /* Large screens and up */
  .booking-list {
    grid-template-columns: repeat(2, 1fr); /* Two columns for large screens */
  }
}

.button-group button {
  background-color: #ffffff; /* White background */
  color: #333; /* Dark text for better contrast */
  border: 1px solid #cccccc; /* Slight border */
  padding: 10px 20px;
  margin: 0 5px;
  border-radius: 5px;
  transition: background-color 0.3s, transform 0.2s;
}

.button-group button:hover {
  background-color: #007bff; /* Bootstrap primary color on hover */
  color: #ffffff;
  transform: translateY(-2px); /* Slight raise effect */
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
</style>

