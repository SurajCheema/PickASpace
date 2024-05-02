<template>
  <div class="admin-refund-management container">
    <h2 class="text-center mb-4">Refund Management</h2>

    <div class="filters mb-4">
      <b-form-input v-model="searchTerm" placeholder="Search by payment ID or user ID" class="mr-2"></b-form-input>
      <b-form-select v-model="selectedStatus" :options="statusOptions" class="mr-2"></b-form-select>
      <b-form-datepicker v-model="startDate" placeholder="Start Date" class="mr-2"></b-form-datepicker>
      <b-form-datepicker v-model="endDate" placeholder="End Date" class="mr-2"></b-form-datepicker>
      <b-button variant="primary" @click="fetchRefunds">Apply Filters</b-button>
    </div>

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
import { BListGroup, BListGroupItem, BButton, BFormInput, BFormSelect, BFormDatepicker } from 'bootstrap-vue-next';
import { fetchRefunds } from '@/services/paymentService';
import RefundDetailsModal from '@/components/RefundDetailsModal.vue';

export default {
  components: {
    BListGroup,
    BListGroupItem,
    BButton,
    BFormInput,
    BFormSelect,
    BFormDatepicker,
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