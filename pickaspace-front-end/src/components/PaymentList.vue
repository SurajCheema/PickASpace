<template>
    <div>
        <b-list-group>
            <b-list-group-item v-for="payment in sortedPayments" :key="payment.payment_id"
                class="d-flex justify-content-between align-items-center" @click="showDetails(payment)">
                <div>
                    <h5 class="mb-1">Payment ID: {{ payment.payment_id }}</h5>
                    <p class="mb-1">Status: {{ payment.paymentStatus }}</p>
                    <p>Amount: £{{ formatAmount(payment.amount) }}</p>
                    <p>Date: {{ new Date(payment.date_paid).toLocaleDateString() }}</p>
                </div>
                <div>
                    <b-button
                        v-if="payment.paymentStatus === 'completed' && payment.log && payment.log.status === 'cancelled'"
                        @click.stop.prevent="refund(payment.payment_id)" variant="danger">Refund</b-button>
                </div>
            </b-list-group-item>
        </b-list-group>

        <!-- Payment Details Modal -->
        <b-modal v-model="modalVisible" title="Payment Details" @hide="clearModal">
            <template v-slot:default>
                <div>
                    <p><strong>Payment ID:</strong> {{ selectedPayment.payment_id }}</p>
                    <p><strong>Amount:</strong> £{{ formatAmount(selectedPayment.amount) }}</p>
                    <p><strong>Status:</strong> {{ selectedPayment.paymentStatus }}</p>
                    <p><strong>Date:</strong> {{ new Date(selectedPayment.date_paid).toLocaleDateString() }}</p>
                    <p><strong>Stripe Payment ID:</strong> {{ selectedPayment.stripePaymentId || 'N/A' }}</p>
                    <p><strong>Receipt URL:</strong> <a :href="selectedPayment.receiptUrl" target="_blank">View Receipt</a></p>
                    <button @click="viewBooking">View Booking</button>
                    <button
                        v-if="selectedPayment.paymentStatus === 'completed' && selectedPayment.log && selectedPayment.log.status === 'cancelled'"
                        @click.stop.prevent="refund(selectedPayment.payment_id)" class="btn btn-danger">
                        Request Refund
                    </button>
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script>
import { BListGroup, BListGroupItem, BButton, BModal } from 'bootstrap-vue-next';
import { requestRefund } from '@/services/paymentService';

export default {
    components: {
        BListGroup,
        BListGroupItem,
        BButton,
        BModal
    },
    props: {
        payments: Array
    },
    data() {
        return {
            modalVisible: false,
            selectedPayment: {},
            refundModalVisible: false,
            selectedPaymentId: null,
        };
    },
    computed: {
        sortedPayments() {
            return this.payments.slice().sort((a, b) => new Date(b.date_paid) - new Date(a.date_paid));
        },
    },
    methods: {
        refund(paymentId) {
        console.log("Opening refund modal for payment ID:", paymentId);
        this.$emit('open-refund-modal', paymentId);  
    },
        formatAmount(amount) {
            const number = parseFloat(amount);
            return isNaN(number) ? '0.00' : number.toFixed(2);
        },
        showDetails(payment) {
            console.log("Showing details for payment ID:", payment.payment_id);
            this.selectedPayment = payment;
            this.modalVisible = true;
        },
        clearModal() {
            console.log("Clearing modal data");
            this.selectedPayment = {};
            this.modalVisible = false;
        },
        viewBooking() {
            console.log('Emitting view-booking event with booking ID:', this.selectedPayment.log.log_id);
            this.$emit('view-booking', this.selectedPayment.log.log_id);
        },
        async handleRefundRequest(paymentId, reason) {
            console.log("Processing refund request for payment ID:", paymentId, "Reason:", reason);
            try {
                const response = await requestRefund(paymentId, reason);
                console.log('Refund successful:', response);
                this.$emit('update');  // Notify parent to refresh the list
                alert('Refund request submitted successfully.');
            } catch (error) {
                console.error('Failed to refund payment:', error);
                alert('Failed to refund payment: ' + error.message);
            }
            this.refundModalVisible = false; // Ensure the modal is closed regardless of outcome
            console.log("Refund modal visibility updated:", this.refundModalVisible);
        },
        handleModalClose() {
            console.log("Closing refund modal");
            this.refundModalVisible = false;
            console.log("Refund modal visibility updated:", this.refundModalVisible);
        }
    }
}
</script>

<style scoped>
.list-group-item {
    padding: 1rem;
    border: 1px solid #dee2e6;
    cursor: pointer; /* Makes it clear the items are interactive */
}
</style>