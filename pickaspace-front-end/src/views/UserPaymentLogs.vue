<template>
  <div class="user-payment-logs">
    <div class="text-center mb-4">
      <button class="btn btn-primary" @click="setFilter('all')">All</button>
      <button class="btn btn-primary" @click="setFilter('completed')">Completed</button>
      <button class="btn btn-primary" @click="setFilter('pending')">Pending</button>
      <button class="btn btn-primary" @click="setFilter('failed')">Failed</button>
      <button class="btn btn-primary" @click="setFilter('refunded')">Refunded</button>
    </div>
    <div>
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

<style>
.user-payment-logs {
  max-width: 800px;
  margin: auto;
}
</style>