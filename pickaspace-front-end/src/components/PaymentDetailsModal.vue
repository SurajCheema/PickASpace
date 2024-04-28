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
        </div>
      </template>
    </b-modal>
  </template>
  
  <script>
  import { BModal } from 'bootstrap-vue-next';
  
  export default {
    components: {
      BModal
    },
    props: {
      payment: Object
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
    methods: {
      formatAmount(amount) {
        const number = parseFloat(amount);
        return isNaN(number) ? '0.00' : number.toFixed(2);
      },
      clearModal() {
        this.$emit('close');
      }
    }
  };
  </script>