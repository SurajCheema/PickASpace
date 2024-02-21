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
            <input type="datetime-local" id="departureTime" class="form-control mx-auto" v-model="departureTime" :min="minDepartureTime">
            <div v-if="!isDepartureValid" class="text-danger">
              Departure time cannot be earlier than arrival time.
            </div>
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
          <button @click="submitBooking" :disabled="!isDepartureValid || !selectedBay" class="btn btn-primary">Submit Booking</button>
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
import { fetchCarParkDetails, bookBay } from '@/services/carParkService';

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
    isDepartureValid() {
      return !this.arrivalTime || !this.departureTime || new Date(this.departureTime) >= new Date(this.arrivalTime);
    },
    minDepartureTime() {
      return this.arrivalTime;
    },
    stayDuration() {
      if (!this.arrivalTime || !this.departureTime) return 0;
      const arrival = new Date(this.arrivalTime);
      const departure = new Date(this.departureTime);
      return ((departure - arrival) / (1000 * 60 * 60)).toFixed(2);
    },
    calculatedCost() {
      if (!this.selectedBay || !this.arrivalTime || !this.departureTime) return 0;
      return this.stayDuration * this.pricing.hourly;
    }
  },
  methods: {
    selectBay(bay) {
      this.selectedBay = this.selectedBay && this.selectedBay.bay_id === bay.bay_id ? null : bay;
    },
    formatCurrency(value) {
      return `£${parseFloat(value).toFixed(2)}`;
    },
    async submitBooking() {
      if (!this.selectedBay || !this.isDepartureValid) {
        alert("Please ensure all fields are correctly filled.");
        return;
      }

      const bookingData = {
        bayId: this.selectedBay.bay_id,
        carparkId: this.carparkId,
        startTime: this.arrivalTime,
        endTime: this.departureTime,
        cost: this.calculatedCost
        // Dummy payment details aren't sent to the server at the moment.
      };

      try {
        const response = await bookBay(
          bookingData.bayId,
          bookingData.carparkId,
          bookingData.startTime,
          bookingData.endTime,
          bookingData.cost
        );
        alert(`Booking successful: ${response.message}`);
      } catch (error) {
        alert(`Booking failed: ${error.message}`);
      }
    }
  },
  async mounted() {
    try {
      const details = await fetchCarParkDetails(this.carparkId);
      this.carParkAddress = details.address;
      this.bays = details.bays;
      this.pricing = details.pricing;
    } catch (error) {
      console.error('Failed to load car park details:', error);
      alert('Failed to load car park details. Please try again later.');
    }
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
