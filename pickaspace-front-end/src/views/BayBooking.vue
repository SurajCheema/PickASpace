<template>
  <div class="container pt-2">
    <div class="row mb-3">
      <div class="col-12">
        <h1 class="text-center font-weight-bold">{{ carParkAddress }}</h1>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-md-8 mb-4">
        <h4 class="text-center">Select Arrival and Departure Time</h4>
        <form class="text-center">
          <div class="form-group">
            <label for="arrivalTime">Arrival Time</label>
            <input type="datetime-local" id="arrivalTime" class="form-control mx-auto" v-model="arrivalTime">
          </div>
          <div class="form-group">
            <label for="departureTime">Departure Time</label>
            <input type="datetime-local" id="departureTime" class="form-control mx-auto" v-model="departureTime">
          </div>
        </form>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-md-8 mb-4">
        <h4>Checkout</h4>
        <div v-if="selectedBay">
          <p>Selected Bay: {{ selectedBay.bay_number }}</p>
          <p>Duration: {{ stayDuration }} hours</p>
          <p>Cost: {{ formatCurrency(calculatedCost) }}</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <h4>Available Bays</h4>
        <div class="row">
          <div class="col-md-3" v-for="bay in bays" :key="bay.bay_id" :class="{ 'selected-bay': selectedBay && selectedBay.bay_id === bay.bay_id }">
            <div class="card mb-3" @click="selectBay(bay)">
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
      selectedBay: null,
      arrivalTime: '',
      departureTime: '',
      pricing: null
    };
  },
  computed: {
    stayDuration() {
      if (!this.arrivalTime || !this.departureTime) return 0;
      const arrival = new Date(this.arrivalTime);
      const departure = new Date(this.departureTime);
      return ((departure - arrival) / (1000 * 60 * 60)).toFixed(2);
    },
    calculatedCost() {
      if (!this.selectedBay || !this.arrivalTime || !this.departureTime) return 0;
      const hours = this.stayDuration;
      return hours * this.pricing.hourly; // TODO: Will adjust to account for daily, monthly, weekly
    }
  },
  methods: {
    selectBay(bay) {
      if (!bay.isAvailable) return;
      this.bays = this.bays.map(b => ({ ...b, isAvailable: b.bay_id === bay.bay_id ? false : b.isAvailable }));
      this.selectedBay = bay;
    },
    formatCurrency(value) {
      return `$${parseFloat(value).toFixed(2)}`;
    }
  },
  async mounted() {
    const details = await fetchCarParkDetails(this.carparkId);
    this.carParkAddress = details.address;
    this.bays = details.bays;
    this.pricing = details.pricing;
  }
};
</script>

<style scoped>
.selected-bay .card {
  background-color: grey;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
  width: 50% !important; 
}
</style>
