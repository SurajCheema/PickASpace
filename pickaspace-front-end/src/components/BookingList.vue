<template>
    <div>
      <b-list-group flush>
        <b-list-group-item
          v-for="booking in bookings"
          :key="booking.log_id"
          button
          class="mb-3"
          @click="showDetails(booking)"
        >
          <div class="d-flex flex-column align-items-start">
            <h5 class="mb-1">Booking ID: {{ booking.log_id }}</h5>
            <p class="mb-1">{{ booking.carPark.addressLine1 }}</p>
            <p>{{ booking.carPark.city }}</p>
          </div>
        </b-list-group-item>
      </b-list-group>
    </div>
  </template>
  
  <script>
  export default {
    props: ['bookings'],
    data() {
      return {
        modalShow: false,
        selectedBooking: {}
      }
    },
    methods: {
      showDetails(booking) {
        this.selectedBooking = booking;
        // Modal or detailed view logic will be implemented here later
        this.modalShow = true; // Placeholder for modal toggle
      }
    }
  }
  </script>
  
  <style scoped>
  .mb-3 {
    margin-bottom: 1rem !important; 
  }
  </style>
  