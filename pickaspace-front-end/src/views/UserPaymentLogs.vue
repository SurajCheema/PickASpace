<template>
  <div class="user-payment-logs">
    <div class="text-center mb-4 button-group">
      <button class="btn mx-2" @click="setFilter('all')">All</button>
      <button class="btn mx-2" @click="setFilter('completed')">Completed</button>
      <button class="btn mx-2" @click="setFilter('pending')">Pending</button>
      <button class="btn mx-2" @click="setFilter('failed')">Failed</button>
      <button class="btn mx-2" @click="setFilter('refunded')">Refunded</button>
    </div>
    <div class="payment-content">
      <payment-list
        :payments="filteredPayments"
        @view-payment="openPaymentDetailsModal"
        @open-refund-modal="openRefundModal"
        @open-refund-status-modal="openRefundStatusModal"
        @refund-resubmitted="fetchPaymentsWrapper"
      />
      <payment-details-modal
        v-if="selectedPayment"
        :payment="selectedPayment"
        @close="closePaymentDetailsModal"
        @view-booking="setSelectedBookingId"
        @booking-cancelled="handleBookingCancelled"
      />
      <booking-details
        v-if="selectedBooking"
        :booking="selectedBooking"
        @close="selectedBooking = null"
        @booking-cancelled="handleBookingCancelled"
      />
      <refund-request-modal
        :is-visible="isRefundModalVisible"
        :payment-id="selectedPaymentId"
        @close="closeRefundModal"
        @request-refund="handleRefundRequest"
      />
    </div>
  </div>
</template>


<script>
import { ref, onMounted, computed } from 'vue';
import PaymentList from '../components/PaymentList.vue';
import PaymentDetailsModal from '../components/PaymentDetailsModal.vue';
import BookingDetails from '../components/BookingDetailsModal.vue';
import RefundRequestModal from '../components/RefundRequestModal.vue';
import { fetchPayments, fetchRefundByPaymentId, requestRefund } from '@/services/paymentService';
import { fetchBookingById } from '@/services/carParkService';

export default {
  components: {
    PaymentList,
    PaymentDetailsModal,
    BookingDetails,
    RefundRequestModal
  },
  setup() {
    const payments = ref([]);
    const isRefundModalVisible = ref(false);
    const selectedPaymentId = ref(null);
    const filter = ref('all');
    const selectedPayment = ref(null);
    const selectedBookingId = ref(null);
    const selectedBooking = ref(null);

    const fetchPaymentsWrapper = async () => {
      try {
        payments.value = await fetchPayments();
        console.log('Fetched payments in UserPaymentLogs:', payments.value);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
        alert('Failed to fetch payments. Please try again.');
      }
    };

    const setFilter = (f) => {
      filter.value = f;
    };

    const filteredPayments = computed(() => {
      return payments.value.filter(p => filter.value === 'all' || p.paymentStatus === filter.value);
    });

    const openPaymentDetailsModal = (payment) => {
      selectedPayment.value = payment;
    };

    const closePaymentDetailsModal = () => {
      selectedPayment.value = null;
    };

    const setSelectedBookingId = async (bookingId) => {
      selectedBookingId.value = bookingId;
      if (bookingId) {
        try {
          selectedBooking.value = await fetchBookingById(bookingId);
        } catch (error) {
          console.error('Error fetching booking details:', error);
          selectedBooking.value = null;
        }
      } else {
        selectedBooking.value = null;
      }
    };

    const handleBookingCancelled = (bookingId) => {
      if (selectedBooking.value && selectedBooking.value.log_id === bookingId) {
        selectedBooking.value.status = 'Cancelled';
      }
    };

    const openRefundModal = (paymentId) => {
      selectedPaymentId.value = paymentId;
      isRefundModalVisible.value = true;
    };

    const openRefundStatusModal = async (paymentId) => {
      console.log('Opening refund status modal for payment ID:', paymentId);
      try {
        const refund = await fetchRefundByPaymentId(paymentId);
        if (refund) {
          console.log('Refund details fetched:', refund);
          // Display the refund details modal with the receipt URL
          // ...
        } else {
          console.error('No refund found for payment ID:', paymentId);
          alert('No refund details found for the selected payment.');
        }
      } catch (error) {
        console.error('Failed to fetch refund details:', error);
        alert('Failed to fetch refund details. Please try again.');
      }
    };

    const closeRefundModal = () => {
      isRefundModalVisible.value = false;
    };

    const handleRefundRequest = async (paymentId, reason, receiptUrl) => {
      try {
        await requestRefund(paymentId, reason, receiptUrl);
        fetchPaymentsWrapper();
        alert('Refund request submitted successfully.');
      } catch (error) {
        console.error('Failed to refund payment:', error);
        alert('Failed to refund payment: ' + error.message);
      }
      closeRefundModal();
    };

    onMounted(fetchPaymentsWrapper);

    return {
      filteredPayments,
      setFilter,
      openPaymentDetailsModal,
      closePaymentDetailsModal,
      selectedPayment,
      selectedBookingId,
      setSelectedBookingId,
      selectedBooking,
      handleBookingCancelled,
      isRefundModalVisible,
      selectedPaymentId,
      openRefundModal,
      closeRefundModal,
      openRefundStatusModal,
      handleRefundRequest
    };
  }
}
</script>

<style scoped>
.user-payment-logs {
  display: block; /* Ensures the div behaves as a block-level element */
  width: 100%; /* Full width for small screens */
  padding: 20px;
  margin: auto; /* Centers the div horizontally */
  margin-top: 2vw;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  background: #f0f0f0;
}

.payment-content {
  margin-top: 20px; /* Add margin between the payment logs list and navbar */

}

@media (min-width: 768px) { /* Medium screens and up */
  .user-payment-logs {
    width: 80%; /* 80% width for medium screens */
  }
}

@media (min-width: 992px) { /* Large screens and up */
  .user-payment-logs {
    width: 70%; /* 70% width for large screens */
  }
}

.payment-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr); /* Single column layout by default */
  gap: 20px; /* Spacing between grid items */
}

.list-group-item{
  margin-top: 1vw;
}

@media (min-width: 992px) { /* Large screens and up */
  .payment-list {
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
  width: 150px; /* Ensures buttons are the same size */
  display: inline-block; /* Ensures buttons align properly */
}

.button-group button:hover {
  background-color: #007bff; /* Bootstrap primary color on hover */
  color: #ffffff;
  transform: translateY(-2px); /* Slight raise effect */
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
</style>
