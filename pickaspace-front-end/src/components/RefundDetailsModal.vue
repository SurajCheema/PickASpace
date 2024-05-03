<!-- components/RefundDetailsModal.vue -->
<template>
  <b-modal :visible="showModal" title="Refund Details" @hidden="$emit('update:showModal', false)">
    <div v-if="refund">
      <p><strong>Refund ID:</strong> {{ refund.refund_id }}</p>
      <p><strong>Payment ID:</strong> {{ refund.payment_id }}</p>
      <p><strong>User ID:</strong> {{ refund.payment.user.user_id }}</p>
      <p><strong>Amount:</strong> {{ refund.amount }}</p>
      <p><strong>Status:</strong> {{ refund.status }}</p>
      <p><strong>Requested At:</strong> {{ refund.createdAt }}</p>
      <p><strong>User Reason:</strong> {{ refund.reason }}</p>

      <div v-if="isAdmin">
        <h4>Admin Decision</h4>
        <b-form-textarea v-model="decision" placeholder="Enter decision reason"></b-form-textarea>
        <b-button variant="success" @click="approveRefund(refund.refund_id)" :disabled="refund.status !== 'requested'">Approve</b-button>
        <b-button variant="danger" @click="denyRefund(refund.refund_id)" :disabled="refund.status !== 'requested'">Deny</b-button>
      </div>
      <div v-else-if="!isAdmin && refund.status === 'denied'">
        <h4>Resubmit Refund Request</h4>
        <b-form-textarea v-model="reason" placeholder="Enter reason for resubmitting"></b-form-textarea>
        <b-button variant="primary" @click="resubmitRefund">Resubmit</b-button>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { BModal, BFormTextarea, BButton } from 'bootstrap-vue-next';
import { updateRefund, resubmitRefund } from '@/services/paymentService';

export default {
  components: {
    BModal,
    BFormTextarea,
    BButton,
  },
  props: {
    refund: {
      type: Object,
      required: true,
    },
    showModal: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      decision: '',
      reason: '',
    };
  },
  computed: {
    isAdmin() {
      return this.$store.state.auth.user && this.$store.state.auth.user.role === 'admin';
    },
  },
  methods: {
    closeModal() {
      this.$emit('update:showModal', false);
    },
    async approveRefund(refundId) {
      this.processRefund(refundId, 'approve');
    },
    async denyRefund(refundId) {
      this.processRefund(refundId, 'deny');
    },
    async processRefund(refundId, status) {
      try {
        console.log(`Processing refund ${refundId} with status ${status}`);
        const response = await updateRefund(refundId, this.decision, status);
        console.log('Refund updated successfully:', response);
        alert(`Refund ${status}d successfully.`);
        this.$emit('refund-updated');
        this.closeModal();
      } catch (error) {
        console.error(`Failed to ${status} refund:`, error);
        alert(`Failed to ${status} refund. Please try again.`);
      }
    },
    async resubmitRefund() {
      try {
        console.log('Resubmitting refund:', this.refund.refund_id);
        await resubmitRefund(this.refund.refund_id, this.reason);
        console.log('Refund resubmitted successfully');
        alert('Refund request resubmitted successfully.');
        this.$emit('refund-updated');
        this.$emit('update:showModal', false);
      } catch (error) {
        console.error('Failed to resubmit refund:', error);
        alert('Failed to resubmit refund. Please try again.');
      }
    },
  },
};
</script>