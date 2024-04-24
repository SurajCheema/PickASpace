<template>
    <div class="user-payment-logs">
      <div class="text-center mb-4">
        <button class="btn btn-primary" @click="setFilter('all')">All</button>
        <button class="btn btn-primary" @click="setFilter('completed')">Completed</button>
        <button class="btn btn-primary" @click="setFilter('pending')">Pending</button>
        <button class="btn btn-primary" @click="setFilter('failed')">Failed</button>
        <button class="btn btn-primary" @click="setFilter('refunded')">Refunded</button>
      </div>
      <div>
        <payment-list :payments="filteredPayments" />
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import PaymentList from '../components/PaymentList.vue';
  import { fetchUserPayments } from '@/services/paymentService';
  
  export default {
    components: {
      PaymentList
    },
    setup() {
      const payments = ref([]);
      const filter = ref('all');
      const filteredPayments = ref([]);
  
      const fetchPayments = async () => {
        payments.value = await fetchUserPayments();
        filterPayments();
      };
  
      const setFilter = (f) => {
        filter.value = f;
        filterPayments();
      };
  
      const filterPayments = () => {
        if (filter.value === 'all') {
          filteredPayments.value = payments.value;
        } else {
          filteredPayments.value = payments.value.filter(p => p.paymentStatus === filter.value);
        }
      };
  
      onMounted(fetchPayments);
  
      return { filteredPayments, setFilter };
    }
  }
  </script>
  
  <style>
  .user-payment-logs {
    max-width: 800px;
    margin: auto;
  }
  </style>
  