<template>
    <div>
      <b-list-group>
        <b-list-group-item
          v-for="booking in bookings"
          :key="booking.id"
          button
          @click="showDetails(booking)"
        >
          {{ booking.summary }}
        </b-list-group-item>
      </b-list-group>
  
      <b-modal>
        v-model="modalShow"
        title="Booking Details"
      
        <p><strong>Date:</strong> {{ selectedBooking.date }}</p>
      </b-modal>
    </div>
  </template>
  
  <script>
  export default {
    props: ['bookings'],
    data() {
      return {
        modalShow: false,
        selectedBooking: null
      };
    },
    methods: {
      showDetails(booking) {
        this.selectedBooking = booking;
        this.modalShow = true;
      }
    }
  }
  </script>
  