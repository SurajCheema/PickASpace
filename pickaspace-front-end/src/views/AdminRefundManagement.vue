<template>
  <div class="admin-refund-management container">
    <h2 class="text-center mb-4">Refund Management</h2>

    <div class="filters mb-4">
      <div class="d-flex justify-content-center align-items-center filter-group">
        <b-form-input v-model="searchTerm" placeholder="Search by payment ID or user ID"
          class="filter-input mr-2"></b-form-input>
        <b-form-select v-model="selectedStatus" :options="statusOptions" class="filter-input mr-2"></b-form-select>
        <b-button variant="primary" size="sm" @click="fetchRefunds">Apply</b-button>
      </div>
    </div>

    <b-list-group class="list-container">
      <b-list-group-item v-for="refund in filteredRefunds" :key="refund.refund_id"
        class="d-flex justify-content-between align-items-center refund-item">
        <div class="refund-info text-left">
          <div><strong>Refund ID:</strong> {{ refund.refund_id }}</div>
          <div><strong>User ID:</strong> {{ refund.payment.user.user_id }}</div>
          <div><strong>Amount:</strong> {{ refund.amount }}</div>
          <div><strong>Status:</strong> {{ refund.status }}</div>
          <div><strong>Requested At:</strong> {{ formatDate(refund.createdAt) }}</div>
        </div>
        <b-button variant="info" size="sm" @click="openRefundModal(refund)">View Details</b-button>
      </b-list-group-item>
    </b-list-group>

    <refund-details-modal :refund="selectedRefund" v-model="showModal"
      @refund-updated="fetchRefunds"></refund-details-modal>
  </div>
</template>

<script>
import { BListGroup, BListGroupItem, BButton, BFormInput, BFormSelect } from 'bootstrap-vue-next';
import { fetchRefunds } from '@/services/paymentService';
import RefundDetailsModal from '@/components/RefundDetailsModal.vue';

export default {
  components: {
    BListGroup,
    BListGroupItem,
    BButton,
    BFormInput,
    BFormSelect,
    RefundDetailsModal,
  },
  data() {
    return {
      refunds: [],
      filteredRefunds: [],
      searchTerm: '',
      selectedStatus: '',
      startDate: '',
      endDate: '',
      selectedRefund: null,
      showModal: false,
      statusOptions: [
        { value: '', text: 'All Statuses' },
        { value: 'requested', text: 'Requested' },
        { value: 'approved', text: 'Approved' },
        { value: 'denied', text: 'Denied' },
      ],
    };
  },
  mounted() {
    this.fetchRefunds();
  },
  methods: {
    async fetchRefunds() {
      try {
        const filters = {
          paymentId: this.searchTerm,
          userId: this.searchTerm,
          status: this.selectedStatus,
          startDate: this.startDate,
          endDate: this.endDate,
        };

        this.refunds = await fetchRefunds(filters);
        this.applyFilters();
      } catch (error) {
        console.error('Failed to fetch refunds:', error);
      }
    },
    applyFilters() {
      this.filteredRefunds = this.refunds.filter(refund => {
        const matchesSearch =
          !this.searchTerm ||
          refund.payment_id.toString().includes(this.searchTerm) ||
          refund.payment.user.user_id.toString().includes(this.searchTerm);
        const matchesStatus = !this.selectedStatus || refund.status === this.selectedStatus;
        const matchesStartDate = !this.startDate || new Date(refund.createdAt) >= new Date(this.startDate);
        const matchesEndDate = !this.endDate || new Date(refund.createdAt) <= new Date(this.endDate);
        return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
      });
    },
    openRefundModal(refund) {
      if (refund) {
        console.log('Selected refund:', refund);
        this.selectedRefund = refund; 
        this.showModal = true;
        console.log('Show modal:', this.showModal);
      }
    },
    closeRefundModal() {
      console.log('Closing refund modal');
      this.showModal = false;
    },
    handleRefundRequest(refundId, reason) {
      console.log('Refund request submitted for refund ID:', refundId, 'with reason:', reason);
      this.closeRefundModal();
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
  },
};
</script>

<style scoped>
.admin-refund-management {
  max-width: 600px;
  /* Adjust width for overall form width */
  margin: 0 auto;
  /* Centers the entire component on the page */
}

.filters {
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.filter-input {
  margin-right: 20px;
  /* Adjust spacing between inputs */
  width: 150px;
  /* Adjust width of input elements */
}

.list-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.refund-item {
  width: 100%;
  /* Make refund items match the width of the container */
  margin-bottom: 10px;
  /* Space between items */
}

.refund-info {
  text-align: left;
}

.refund-info div {
  margin-bottom: 5px;
}
</style>
