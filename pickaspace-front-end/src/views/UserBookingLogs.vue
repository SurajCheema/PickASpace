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
        @cancel-booking="cancelBooking" />
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
        past: []
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
        const now = new Date();

        this.bookings.current = this.sortBookingsByStartDate(
          fetchedBookings.current.filter(booking =>
            new Date(booking.startTime) <= now &&
            new Date(booking.endTime) >= now &&
            booking.status !== 'cancelled'
          )
        );

        this.bookings.upcoming = this.sortBookingsByStartDate(
          fetchedBookings.upcoming.filter(booking =>
            new Date(booking.startTime) > now &&
            booking.status !== 'cancelled'
          )
        );

        this.bookings.past = this.sortBookingsByStartDate(
          fetchedBookings.past.concat(
            fetchedBookings.current.filter(booking => booking.status === 'Cancelled'),
            fetchedBookings.upcoming.filter(booking => booking.status === 'Cancelled')
          ),
          true
        );

        this.bookings.cancelled = this.sortBookingsByStartDate(
          fetchedBookings.current.filter(booking => booking.status === 'cancelled')
            .concat(fetchedBookings.upcoming.filter(booking => booking.status === 'cancelled')),
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
        await cancelBookingService(bookingId);
        this.fetchBookings(); // Refresh bookings after cancellation
      } catch (error) {
        console.error('Error cancelling booking:', error);
      }
    },
    handleBookingCancelled(bookingId) {
      // Find the cancelled booking in current, upcoming, or past tabs
      const cancelledBooking = this.bookings.current.find(b => b.log_id === bookingId)
        || this.bookings.upcoming.find(b => b.log_id === bookingId)
        || this.bookings.past.find(b => b.log_id === bookingId);

      if (cancelledBooking) {
        // Update the status of the cancelled booking
        cancelledBooking.status = 'cancelled';

        // Move the cancelled booking to the cancelled tab
        this.bookings.cancelled.unshift(cancelledBooking);

        // Remove the cancelled booking from its original tab
        this.bookings.current = this.bookings.current.filter(b => b.log_id !== bookingId);
        this.bookings.upcoming = this.bookings.upcoming.filter(b => b.log_id !== bookingId);
        this.bookings.past = this.bookings.past.filter(b => b.log_id !== bookingId);

        // Update the active bookings
        this.updateActiveBookings();
      }
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