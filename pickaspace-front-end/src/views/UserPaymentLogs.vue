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
            <payment-list :payments="filteredPayments" @view-booking="setSelectedBookingId"
                @open-refund-modal="openRefundModal" />
            <booking-details v-if="selectedBooking" :booking="selectedBooking" @close="selectedBooking = null"
                @booking-cancelled="handleBookingCancelled" />
            <refund-request-modal :is-visible="isRefundModalVisible" :payment-id="selectedPaymentId"
                @close="handleModalClose" @request-refund="handleRefundRequest" />
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import PaymentList from '../components/PaymentList.vue';
import BookingDetails from '../components/BookingDetailsModal.vue';
import { fetchPayments } from '@/services/paymentService';
import { fetchBookingById } from '@/services/carParkService';
import RefundRequestModal from '../components/RefundRequestModal.vue';

export default {
    components: {
        PaymentList,
        BookingDetails,
        RefundRequestModal
    },
    setup() {
        const payments = ref([]);
        const isRefundModalVisible = ref(false);  // Reactive variable to control modal visibility
        const selectedPaymentId = ref(null);
        const filter = ref('all');
        const filteredPayments = ref([]);
        const selectedBookingId = ref(null);
        const selectedBooking = ref(null);

        const fetchPaymentsWrapper = async () => {
            payments.value = await fetchPayments();
            filterPayments();
        };

        const setFilter = (f) => {
            filter.value = f;
            filterPayments();
        };

        const filterPayments = () => {
            if (filter.value === 'all') {
                filteredPayments.value = payments.value;
            } else {
                filteredPayments.value = payments.value.filter(p => p.paymentStatus === filter.value);
            }
        };

        const setSelectedBookingId = async (log_id) => {
            console.log('Selected log_id:', log_id);
            selectedBookingId.value = log_id;
            if (log_id) {
                try {
                    selectedBooking.value = await fetchBookingById(log_id);
                    console.log('Selected booking:', selectedBooking.value);
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

        function openRefundModal(paymentId) {
            selectedPaymentId.value = paymentId;
            isRefundModalVisible.value = true;  // Set modal to visible
        }

        onMounted(fetchPaymentsWrapper);

        return {
            filteredPayments,
            setFilter,
            selectedBookingId,
            setSelectedBookingId,
            selectedBooking,
            handleBookingCancelled,
            isRefundModalVisible,
            selectedPaymentId,
            openRefundModal,
        };
    },
}
</script>

<style>
.user-payment-logs {
    max-width: 800px;
    margin: auto;
}
</style>