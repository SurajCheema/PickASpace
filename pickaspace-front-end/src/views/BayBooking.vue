<template>
    <div class="container py-5">
    <h2 class="text-center font-weight-bold mb-4">{{ carParkAddress }}</h2>
      <!-- Arrival and Departure Time Selection -->
      <div class="row mb-3">
        <div class="col-md-6">
          <h4>Select Arrival and Departure Time</h4>
          <!-- Input fields for time selection -->
          <!-- Placeholder buttons for Day, Week, Month -->
        </div>
  
        <!-- Checkout Box -->
        <div class="col-md-6">
          <h4>Checkout</h4>
          <!-- Display selected bay and final price -->
        </div>
      </div>
  
        <!-- Display Bays -->
        <div class="row">
        <div class="col-12">
            <h4>Available Bays</h4>
            <div class="row">
            <div class="col-md-3" v-for="(bay, index) in bays" :key="bay.bay_id" :class="{'new-row': (index % 10 === 0) && index !== 0}">
                <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Bay {{ bay.bay_number }}</h5>
                    <p class="card-text">EV Charging: {{ bay.hasEVCharging ? 'Yes' : 'No' }}</p>
                    <p class="card-text">Disabled Access: {{ bay.disabled ? 'Yes' : 'No' }}</p>
                    <p class="card-text">Available: {{ bay.isAvailable ? 'Yes' : 'No' }}</p>
                    <p class="card-text">Vehicle Size: {{ bay.vehicleSize }}</p>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    </div>
  </template>
  
  <script>
  import { fetchCarParkDetails } from '@/services/carParkService';

  export default {
  name: 'BayBooking',
  props: ['carparkId'],
  data() {
    return {
      carParkAddress: '',
      bays: [],
    };
  },
  async mounted() {
    const carparkId = this.$route.params.carparkId;
    const carParkDetails = await fetchCarParkDetails(carparkId);
    this.carParkAddress = `${carParkDetails.addressLine1}, ${carParkDetails.city}, ${carParkDetails.postcode}`;
    this.bays = carParkDetails.bays;
  },
};
  </script>
  
  <style scoped>
    .new-row {
    clear: both;
    }
  </style>
  