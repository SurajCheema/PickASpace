<template>
  <div>
    <b-list-group>
      <b-list-group-item
        v-for="payment in sortedPayments"
        :key="payment.payment_id"
        class="d-flex justify-content-between align-items-center"
        @click="$emit('view-payment', payment)"
      >
        <div>
          <h5 class="mb-1">Payment ID: {{ payment.payment_id }}</h5>
          <p class="mb-1">Status: {{ payment.paymentStatus }}</p>
          <p>Amount: £{{ formatAmount(payment.amount) }}</p>
          <p>Date: {{ new Date(payment.date_paid).toLocaleDateString() }}</p>
        </div>
        <div>
          <b-button
            v-if="payment.paymentStatus === 'completed' && payment.log && payment.log.status === 'cancelled' && !payment.refund"
            @click.stop.prevent="openRefundModal(payment.payment_id)"
            variant="danger"
          >
            Refund
          </b-button>
          <b-button
            v-if="payment.refund"
            @click.stop.prevent="openRefundStatusModal(payment)"
            variant="info"
          >
            Refund Status
          </b-button>
        </div>
      </b-list-group-item>
    </b-list-group>

    <!-- Refund Details Modal -->
    <b-modal v-model="refundModalVisible" title="Refund Details">
      <template v-if="selectedRefund">
        <p><strong>Refund ID:</strong> {{ selectedRefund.refund_id }}</p>
        <p><strong>Payment ID:</strong> {{ selectedRefund.payment_id }}</p>
        <p><strong>Receipt URL:</strong> <a :href="selectedRefund.receiptUrl" target="_blank"
            class="text-primary text-decoration-underline">View Receipt by clicking the payment</a></p>
        <p><strong>Amount:</strong> {{ selectedRefund.amount }}</p>
        <p><strong>Status:</strong> {{ selectedRefund.status }}</p>
        <p><strong>Requested At:</strong> {{ formatDate(selectedRefund.createdAt) }}</p>
        <p><strong>Processed At:</strong> {{ formatDate(selectedRefund.processedAt) }}</p>
        <p><strong>User Reason:</strong> {{ selectedRefund.reason }}</p>
        <p><strong>Admin Decision:</strong> {{ selectedRefund.decision }}</p>
        <b-button v-if="selectedRefund.status === 'denied' && !showResubmitForm" @click="toggleResubmitForm"
          variant="primary">Resubmit Refund Request</b-button>
      </template>
      <template v-else>
        <p>No refund details available.</p>
      </template>
      <template v-if="selectedRefund && selectedRefund.status === 'denied' && showResubmitForm">
        <hr>
        <h5>Resubmit Refund Request</h5>
        <b-form @submit.prevent="handleResubmitRefund">
          <b-form-group label="Reason:" label-for="resubmit-reason">
            <b-form-textarea id="resubmit-reason" v-model="resubmitReason" required></b-form-textarea>
          </b-form-group>
          <b-button type="submit" variant="primary">Submit</b-button>
          <b-button @click="toggleResubmitForm" variant="secondary">Cancel</b-button>
        </b-form>
      </template>
    </b-modal>
  </div>

  <!-- Success Modal -->
  <b-modal ref="successModal" title="Success" ok-only ok-variant="success" @ok="$refs.successModal.hide()">
    Refund request resubmitted successfully.
  </b-modal>

  <!-- Error Modal -->
  <b-modal ref="errorModal" title="Error" ok-only ok-variant="danger" @ok="$refs.errorModal.hide()">
    Failed to resubmit refund request. Please try again.
  </b-modal>
</template>

<script>
import { BListGroup, BListGroupItem, BButton, BModal, BForm, BFormGroup, BFormTextarea } from 'bootstrap-vue-next';
import { resubmitRefund } from '@/services/paymentService';

export default {
  components: {
    BListGroup,
    BListGroupItem,
    BButton,
    BModal,
    BForm,
    BFormGroup,
    BFormTextarea
  },
  props: {
    payments: Array
  },
  data() {
    return {
      modalVisible: false,
      refundModalVisible: false,
      selectedPayment: {},
      selectedRefund: null,
      resubmitReason: '',
      showResubmitForm: false
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
    openRefundStatusModal(payment) {
      this.selectedRefund = payment.refund;
      this.refundModalVisible = true;
      this.$emit('open-refund-status-modal', payment.payment_id);
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleString() : 'N/A';
    },
    toggleResubmitForm() {
      this.showResubmitForm = !this.showResubmitForm;
      if (!this.showResubmitForm) {
        this.resubmitReason = '';
      }
    },
    async handleResubmitRefund() {
      const refundId = this.selectedRefund.refund_id;
      const reason = this.resubmitReason;
      if (reason) {
        try {
          await resubmitRefund(refundId, reason);
          this.resubmitReason = '';
          this.showResubmitForm = false;
          this.$emit('refund-resubmitted');
          this.$refs.successModal.show();
        } catch (error) {
          console.error('Failed to resubmit refund request:', error);
          this.$refs.errorModal.show();
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