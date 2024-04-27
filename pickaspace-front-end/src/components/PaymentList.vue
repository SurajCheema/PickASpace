<template>
    <div>
        <b-list-group>
            <b-list-group-item v-for="payment in payments" :key="payment.payment_id"
                class="d-flex justify-content-between align-items-center" @click="showDetails(payment)">
                <div>
                    <h5 class="mb-1">Payment ID: {{ payment.payment_id }}</h5>
                    <p class="mb-1">Status: {{ payment.paymentStatus }}</p>
                    <p>Amount: £{{ formatAmount(payment.amount) }}</p>
                    <p>Date: {{ new Date(payment.date_paid).toLocaleDateString() }}</p>
                </div>
                <div>
                    <b-button v-if="payment.paymentStatus === 'pending'" @click.stop="refund(payment.payment_id)"
                        variant="danger">Refund</b-button>
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
                    <p><strong>Receipt URL:</strong> <a :href="selectedPayment.receiptUrl" target="_blank">View
                            Receipt</a></p>
                    <button @click="viewBooking">View Booking</button>

                </div>
            </template>
        </b-modal>
    </div>
</template>

<script>
import { BListGroup, BListGroupItem, BButton, BModal } from 'bootstrap-vue-next';
import { refundPayment } from '@/services/paymentService';

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
            selectedPayment: {}
        };
    },
    methods: {
        async refund(paymentId) {
            try {
                await refundPayment(paymentId);
                this.$emit('update');  // Notify parent to refresh the list
            } catch (error) {
                alert('Failed to refund payment: ' + error.message);
            }
        },
        formatAmount(amount) {
            const number = parseFloat(amount);
            return isNaN(number) ? '0.00' : number.toFixed(2);
        },
        showDetails(payment) {
            this.selectedPayment = payment;
            this.modalVisible = true;
        },
        clearModal() {
            this.selectedPayment = {};
            this.modalVisible = false;
        },
        viewBooking() {
            console.log('Emitting view-booking event with booking ID:', this.selectedPayment.log.log_id);
            this.$emit('view-booking', this.selectedPayment.log.log_id);
        }
    }
}
</script>

<style scoped>
.list-group-item {
    padding: 1rem;
    border: 1px solid #dee2e6;
    cursor: pointer;
    /* Makes it clear the items are interactive */
}
</style>