<template>
  <b-modal :visible="showModal" title="Refund Details" @hidden="$emit('update:showModal', false)">
    <div v-if="refund">
      <!-- Expanded Refund Details -->
      <p><strong>Refund ID:</strong> {{ refund.refund_id }}</p>
      <p><strong>Payment ID:</strong> {{ refund.payment_id }}</p>
      <p><strong>Stripe Refund ID:</strong> {{ refund.stripeRefundId || 'N/A' }}</p>
      <p><strong>Receipt:</strong> <a v-if="refund.payment && refund.payment.receiptUrl" :href="refund.payment.receiptUrl" target="_blank" class="receipt-link">View receipt</a><span v-else>N/A</span></p>
      <p><strong>Amount:</strong> {{ refund.amount }}</p>
      <p><strong>Status:</strong> {{ refund.status }}</p>
      <p><strong>Requested At:</strong> {{ formatDate(refund.createdAt) }}</p>
      <p><strong>User Reason:</strong> {{ refund.reason || 'N/A' }}</p>
      <p><strong>Log ID:</strong> {{ refund.log_id }}</p>
      <p><strong>Processed At:</strong> {{ formatDate(refund.processedAt) }}</p>
      <p><strong>Created By:</strong> {{ refund.createdBy }}</p>
      <p><strong>Updated By:</strong> {{ refund.updatedBy }}</p>
      <p><strong>Decision:</strong> {{ refund.decision || 'N/A' }}</p>

      <!-- Conditional Rendering for Buttons -->
      <div v-if="refund.status === 'requested' || refund.status === 'denied'">
        <h4>Admin Decision</h4>
        <b-form-textarea v-model="decision" placeholder="Enter decision reason"></b-form-textarea>
        <b-button variant="success" @click="approveRefund(refund.refund_id)" :disabled="!decision.trim()">Approve</b-button>
        <b-button variant="danger" @click="denyRefund(refund.refund_id)" :disabled="!decision.trim()">Deny</b-button>
      </div>
    </div>
    <div v-else>
      <p>No refund details available.</p>
    </div>
  </b-modal>
</template>

<script>
import { BModal, BFormTextarea, BButton } from 'bootstrap-vue-next';

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
    approveRefund(refundId) {
      if (!this.decision.trim()) {
        alert('Please enter a decision reason before approving the refund.');
        return;
      }
      this.processRefund(refundId, 'approve');
    },
    denyRefund(refundId) {
      if (!this.decision.trim()) {
        alert('Please enter a decision reason before denying the refund.');
        return;
      }
      this.processRefund(refundId, 'deny');
    },
    processRefund(refundId, status) {
      this.updateRefund(refundId, this.decision, status).then(response => {
        alert(`Refund ${status} successfully.`);
        console.log(response);
        this.$emit('refund-updated');
        this.closeModal();
      }).catch(error => {
        if (error.message.includes('Refund is already denied')) {
          alert('Refund is already denied.');
        } else {
          alert(`Failed to ${status} refund: ${error.message}`);
        }
      });
    },
    async updateRefund(refundId, decision, status) {
      const url = `http://localhost:3000/api/refunds/${refundId}/${status}`;
      const body = JSON.stringify({ decision });
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
        return await response.json();
      } catch (error) {
        console.error('Error updating refund:', error);
        throw new Error(error.message);
      }
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleString() : 'N/A';
    }
  }
};
</script>

<style scoped>
.receipt-link {
  color: #007bff;
  text-decoration: underline;
}

.receipt-link:hover {
  color: #0056b3;
}

.modal-content {
  max-height: calc(100vh - 210px);
  overflow-y: auto;
}

p {
  word-wrap: break-word;
}
</style>
