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

      <div v-if="refund.status === 'requested'">
        <h4>Admin Decision</h4>
        <b-form-textarea v-model="decision" placeholder="Enter decision reason"></b-form-textarea>
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
      decision: '',
    };
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
        const response = await updateRefund(refundId, this.decision, status);
        alert(`Refund ${status} successfully.`);
        console.log(response);
        this.$emit('refund-updated');
        this.closeModal();
      } catch (error) {
        console.error(`Failed to ${status} refund:`, error);
        alert(`Failed to ${status} refund. Please try again.`);
      }
    }
  },
};
</script>
