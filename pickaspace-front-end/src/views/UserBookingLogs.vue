<template>
  <div class="user-booking-logs">
    <div class="text-center mb-4">
      <button class="btn btn-primary mx-2" @click="setActive('current')">Current</button>
      <button class="btn btn-primary mx-2" @click="setActive('upcoming')">Upcoming</button>
      <button class="btn btn-primary mx-2" @click="setActive('past')">Past</button>
      <button class="btn btn-primary mx-2" @click="setActive('cancelled')">Cancelled</button>
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
import { fetchUserBookings, cancelBooking as cancelBookingService } from '@/services/carParkService'; 
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
    showBookingDetailsModal(booking) {
      this.bookingDetails = booking;
      this.isBookingDetailsModalVisible = true;
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

<style>
.user-booking-logs {
  max-width: 800px;
  margin: auto;
}
</style>