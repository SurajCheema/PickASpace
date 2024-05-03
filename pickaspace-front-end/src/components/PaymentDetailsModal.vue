<template>
  <b-modal v-model="modalVisible" title="Payment Details" @hide="clearModal">
    <template v-slot:default>
      <div v-if="payment">
        <p><strong>Payment ID:</strong> {{ payment.payment_id }}</p>
        <p><strong>Amount:</strong> £{{ formatAmount(payment.amount) }}</p>
        <p><strong>Status:</strong> {{ payment.paymentStatus }}</p>
        <p><strong>Date:</strong> {{ new Date(payment.date_paid).toLocaleDateString() }}</p>
        <p><strong>Stripe Payment ID:</strong> {{ payment.stripePaymentId || 'N/A' }}</p>
        <p><strong>Receipt URL:</strong> <a :href="payment.receiptUrl" target="_blank">View Receipt</a></p>
        <!-- Check for refund existence -->
        <button v-if="hasRefund" @click="viewRefundStatus">View Refund Status</button>
      </div>
    </template>
  </b-modal>
  <refund-details-modal v-if="selectedRefund" :refund="selectedRefund" :show-modal="showRefundModal"
    @update:show-modal="showRefundModal = $event" @refund-updated="$emit('refund-updated')"></refund-details-modal>
</template>

<script>
import { BModal } from 'bootstrap-vue-next';
import RefundDetailsModal from '@/components/RefundDetailsModal.vue';
import { fetchRefundByPaymentId } from '@/services/paymentService';

export default {
  components: {
    BModal,
    RefundDetailsModal
  },
  props: {
    payment: Object
  },
  data() {
    return {
      selectedRefund: null,
      showRefundModal: false,
      hasRefund: false
    };
  },
  computed: {
    modalVisible: {
      get() {
        return !!this.payment;
      },
      set(value) {
        if (!value) {
          this.$emit('close');
        }
      }
    }
  },
  watch: {
    payment: {
      immediate: true,
      async handler(newVal) {
        if (newVal && newVal.refund) {
          this.hasRefund = true;
        } else {
          this.hasRefund = false;
        }
      }
    },
    methods: {
      formatAmount(amount) {
        const number = parseFloat(amount);
        return isNaN(number) ? '0.00' : number.toFixed(2);
      },
      clearModal() {
        this.$emit('close');
      },
      async viewRefundStatus() {
        try {
          console.log('Fetching refund for payment ID:', this.payment.payment_id);
          this.selectedRefund = await fetchRefundByPaymentId(this.payment.payment_id);
          if (this.selectedRefund) {
            console.log('Refund found:', this.selectedRefund);
            this.showRefundModal = true;
          } else {
            console.log('No refund found for payment ID:', this.payment.payment_id);
            alert('No refund found for this payment.');
          }
        } catch (error) {
          console.error('Failed to fetch refund:', error);
          alert('Failed to fetch refund status. Please try again.');
        }
      },
      async checkRefundStatus(payment) {
        if (payment && payment.payment_id) {
          try {
            console.log('Checking refund status for payment ID:', payment.payment_id);
            const refund = await fetchRefundByPaymentId(payment.payment_id);
            this.hasRefund = !!refund;
            console.log('Refund status:', this.hasRefund);
          } catch (error) {
            console.error('Failed to check refund status:', error);
            this.hasRefund = false;
          }
        } else {
          this.hasRefund = false;
        }
      }
    }
  }
};
</script>