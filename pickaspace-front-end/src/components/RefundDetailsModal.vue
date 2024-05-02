<template>
  <b-modal :visible="showModal" title="Refund Details" @hidden="closeModal">
    <div v-if="refund">
      <p><strong>Refund ID:</strong> {{ refund.refund_id }}</p>
      <p><strong>Payment ID:</strong> {{ refund.payment_id }}</p>
      <p><strong>User ID:</strong> {{ refund.payment.user.user_id }}</p>
      <p><strong>Amount:</strong> {{ refund.amount }}</p>
      <p><strong>Status:</strong> {{ refund.status }}</p>
      <p><strong>Requested At:</strong> {{ refund.createdAt }}</p>
      <p><strong>User Reason:</strong> {{ refund.reason }}</p>

      <div v-if="refund.status === 'requested'">
        <h4>Admin Decision</h4>
        <b-form-textarea v-model="adminDecision" placeholder="Enter decision reason"></b-form-textarea>
        <b-button variant="success" @click="approveRefund(refund.refund_id)">Approve</b-button>
        <b-button variant="danger" @click="denyRefund(refund.refund_id)">Deny</b-button>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { BModal, BFormTextarea, BButton } from 'bootstrap-vue-next';
import { updateRefund } from '@/services/paymentService';

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
      adminDecision: '',
    };
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    async approveRefund(refundId) {
      try {
        await updateRefund(refundId, this.adminDecision, 'approved');
        alert('Refund approved successfully.');
        this.$emit('refund-updated');
        this.closeModal();
      } catch (error) {
        console.error('Failed to approve refund:', error);
        alert('Failed to approve refund. Please try again.');
      }
    },
    async denyRefund(refundId) {
      try {
        await updateRefund(refundId, this.adminDecision, 'denied');
        alert('Refund denied successfully.');
        this.$emit('refund-updated');
        this.closeModal();
      } catch (error) {
        console.error('Failed to deny refund:', error);
        alert('Failed to deny refund. Please try again.');
      }
    },
  },
};
</script>