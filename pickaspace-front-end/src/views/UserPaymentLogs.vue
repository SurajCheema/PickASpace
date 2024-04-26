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
            <payment-list :payments="filteredPayments" @view-booking="setSelectedBookingId" />
            <booking-details v-if="selectedBookingId" :booking-id="selectedBookingId" @close="selectedBookingId = null" />
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import PaymentList from '../components/PaymentList.vue';
import BookingDetails from '../components/BookingDetailsModal.vue'; // Import the BookingDetails component
import { fetchPayments } from '@/services/paymentService';  

export default {
    components: {
        PaymentList,
        BookingDetails
    },
    setup() {
        const payments = ref([]);
        const filter = ref('all');
        const filteredPayments = ref([]);
        const selectedBookingId = ref(null);

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

        const setSelectedBookingId = (bookingId) => {
            selectedBookingId.value = bookingId;
        };

        onMounted(fetchPaymentsWrapper); 

        return { filteredPayments, setFilter, selectedBookingId, setSelectedBookingId };
    }
}
</script>

<style>
.user-payment-logs {
    max-width: 800px;
    margin: auto;
}
</style>