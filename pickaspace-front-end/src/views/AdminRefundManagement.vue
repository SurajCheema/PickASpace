<template>
  <div class="admin-refund-management container">
    <h2 class="text-center mb-4">Refund Management</h2>

    <b-form class="mb-4">
      <b-row>
        <b-col cols="12" md="3">
          <b-form-input v-model="searchTerm" placeholder="Search by payment ID or user ID"></b-form-input>
        </b-col>
        <b-col cols="12" md="3">
          <b-form-select v-model="selectedStatus" :options="statusOptions"></b-form-select>
        </b-col>
        <b-col cols="12" md="2">
          <b-form-datepicker v-model="startDate" placeholder="Start Date"></b-form-datepicker>
        </b-col>
        <b-col cols="12" md="2">
          <b-form-datepicker v-model="endDate" placeholder="End Date"></b-form-datepicker>
        </b-col>
        <b-col cols="12" md="2">
          <b-button variant="primary" @click="fetchRefunds">Apply Filters</b-button>
        </b-col>
      </b-row>
    </b-form>

    <b-list-group>
      <b-list-group-item v-for="refund in filteredRefunds" :key="refund.refund_id" class="d-flex justify-content-between align-items-center">
        <div>
          <strong>Refund ID:</strong> {{ refund.refund_id }}<br>
          <strong>Payment ID:</strong> {{ refund.payment_id }}<br>
          <strong>User ID:</strong> {{ refund.payment.user.user_id }}<br>
          <strong>Amount:</strong> {{ refund.amount }}<br>
          <strong>Status:</strong> {{ refund.status }}<br>
          <strong>Requested At:</strong> {{ refund.createdAt }}
        </div>
        <b-button variant="info" size="sm" @click="openRefundModal(refund)">View Details</b-button>
      </b-list-group-item>
    </b-list-group>

    <refund-details-modal
      :refund="selectedRefund"
      :show-modal="showModal"
      @close="closeRefundModal"
      @refund-updated="fetchRefunds"
    ></refund-details-modal>
  </div>
</template>

<script>
import { fetchRefunds } from '@/services/paymentService';
import RefundDetailsModal from '@/components/RefundDetailsModal.vue';

export default {
  components: {
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
        this.refunds = await fetchRefunds();
        this.applyFilters();
      } catch (error) {
        console.error('Failed to fetch refunds:', error);
        alert('Failed to fetch refunds. Please try again.');
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
      this.selectedRefund = refund;
      this.showModal = true;
    },
    closeRefundModal() {
      this.selectedRefund = null;
      this.showModal = false;
    },
  },
};
</script>

<style scoped>
/* Add your custom styles here */
</style>