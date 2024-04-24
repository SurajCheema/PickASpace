<template>
    <div>
      <b-list-group>
        <b-list-group-item v-for="payment in payments" :key="payment.payment_id" class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">Payment ID: {{ payment.payment_id }}</h5>
            <p class="mb-1">Status: {{ payment.paymentStatus }}</p>
            <p>Amount: £{{ payment.amount.toFixed(2) }}</p>
            <p>Date: {{ new Date(payment.date_paid).toLocaleDateString() }}</p>
          </div>
          <div>
            <b-button v-if="payment.paymentStatus === 'pending'" @click="refund(payment.payment_id)" variant="danger">Refund</b-button>
          </div>
        </b-list-group-item>
      </b-list-group>
    </div>
  </template>
  
  <script>
  import { BListGroup, BListGroupItem, BButton } from 'bootstrap-vue-next';
  import { refundPayment } from '@/services/paymentService';
  
  export default {
    components: {
      BListGroup,
      BListGroupItem,
      BButton
    },
    props: {
      payments: Array
    },
    methods: {
      async refund(paymentId) {
        try {
          await refundPayment(paymentId);
          this.$emit('update');  // Notify parent to refresh the list
        } catch (error) {
          alert('Failed to refund payment: ' + error.message);
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .list-group-item {
    padding: 1rem;
    border: 1px solid #dee2e6;
  }
  </style>
  