<template>
  <div>
    <b-list-group>
      <b-list-group-item 
        v-for="payment in sortedPayments" 
        :key="payment.payment_id"
        class="d-flex justify-content-between align-items-center"
        @click="showDetails(payment)">

        <div>
          <h5 class="mb-1">Payment ID: {{ payment.payment_id }}</h5>
          <p class="mb-1">Status: {{ payment.paymentStatus }}</p>
          <p>Amount: £{{ formatAmount(payment.amount) }}</p>
          <p>Date: {{ new Date(payment.date_paid).toLocaleDateString() }}</p>
        </div>
        <div>
          <b-button v-if="payment.paymentStatus === 'completed' && payment.log && payment.log.status === 'cancelled' && !payment.refund"
                    @click.stop.prevent="openRefundModal(payment.payment_id)" variant="danger">Refund</b-button>
          <b-button v-if="payment.refund" @click.stop.prevent="openRefundStatusModal(payment)" variant="info">Refund Status</b-button>
        </div>
      </b-list-group-item>
    </b-list-group>

    <!-- Payment Details Modal -->
    <b-modal v-model="modalVisible" title="Payment Details">
      <p><strong>Payment ID:</strong> {{ selectedPayment.payment_id }}</p>
      <p><strong>Amount:</strong> £{{ formatAmount(selectedPayment.amount) }}</p>
      <p><strong>Status:</strong> {{ selectedPayment.paymentStatus }}</p>
      <p><strong>Date:</strong> {{ new Date(selectedPayment.date_paid).toLocaleDateString() }}</p>
      <p><strong>Stripe Payment ID:</strong> {{ selectedPayment.stripePaymentId || 'N/A' }}</p>
      <p><strong>Receipt URL:</strong> <a :href="selectedPayment.receiptUrl" target="_blank">View Receipt</a></p>
    </b-modal>

    <!-- Refund Details Modal -->
    <b-modal v-model="refundModalVisible" title="Refund Details">
    <template v-if="selectedRefund">
        <p><strong>Refund ID:</strong> {{ selectedRefund.refund_id }}</p>
        <p><strong>Payment ID:</strong> {{ selectedRefund.payment_id }}</p>
        <p><strong>Amount:</strong> {{ selectedRefund.amount }}</p>
        <p><strong>Status:</strong> {{ selectedRefund.status }}</p>
        <p><strong>Requested At:</strong> {{ formatDate(selectedRefund.createdAt) }}</p>
        <p><strong>Processed At:</strong> {{ formatDate(selectedRefund.processedAt) }}</p>
        <p><strong>User Reason:</strong> {{ selectedRefund.reason }}</p>
        <p><strong>Admin Decision:</strong> {{ selectedRefund.decision }}</p>
      <b-button v-if="selectedRefund.status === 'denied'" @click="resubmitRefund" variant="primary">Resubmit Refund Request</b-button>      </template>
      <template v-else>
        <p>No refund details available.</p>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { BListGroup, BListGroupItem, BButton, BModal } from 'bootstrap-vue-next';
import { resubmitRefund } from '@/services/paymentService';

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
      refundModalVisible: false,
      selectedPayment: {},
      selectedRefund: null
    };
  },
  computed: {
    sortedPayments() {
      return this.payments.slice().sort((a, b) => new Date(b.date_paid) - new Date(a.date_paid));
    },
  },
  methods: {
    openRefundModal(paymentId) {
      this.$emit('open-refund-modal', paymentId);
    },
    formatAmount(amount) {
      return isNaN(parseFloat(amount)) ? '0.00' : parseFloat(amount).toFixed(2);
    },
    showDetails(payment) {
      this.selectedPayment = payment;
      this.modalVisible = true;
    },
    openRefundStatusModal(payment) {
      this.selectedRefund = payment.refund;
      this.refundModalVisible = true;
      this.$emit('open-refund-status-modal', payment.payment_id);
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleString() : 'N/A';
    },
    async resubmitRefund() {
      const refundId = this.selectedRefund.refund_id;
      const reason = prompt('Please provide a reason for resubmitting the refund request:');
      if (reason) {
        try {
          await resubmitRefund(refundId, reason);
          alert('Refund request resubmitted successfully.');
          this.$emit('refund-resubmitted');
        } catch (error) {
          console.error('Failed to resubmit refund request:', error);
          alert('Failed to resubmit refund request. Please try again.');
        }
      }
    }
  }
}
</script>

<style scoped>
.list-group-item {
  padding: 1rem;
  border: 1px solid #dee2e6;
  cursor: pointer;
}
</style>