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
          <!-- Credit Card Input -->
          <div class="form-group">
            <label for="creditCard">Credit Card Number</label>
            <input type="text" id="creditCard" class="form-control" v-model="creditCard" placeholder="1234 5678 9012 3456" @input="validateCreditCard">
            <div v-if="creditCardError" class="text-danger">{{ creditCardError }}</div>
          </div>
          <div class="text-danger" v-if="submitError">{{ submitError }}</div>
          <button @click="submitBooking" :disabled="!isDepartureValid || !selectedBay" class="btn btn-primary">Submit Booking</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <h4>Available Bays</h4>
        <div class="row">
          <div class="col-md-3" v-for="bay in bays" :key="bay.bay_id" :class="{ 'selected-bay': selectedBay && selectedBay.bay_id === bay.bay_id }">
              <div class="card mb-3 hover-highlight" @click="selectBay(bay)">
              <div class="card-body">
                <h5 class="card-title">Bay {{ bay.bay_number }}</h5>
                <p class="card-text">EV Charging: {{ bay.hasEVCharging ? 'Yes' : 'No' }}</p>
                <p class="card-text">Disabled Access: {{ bay.disabled ? 'Yes' : 'No' }}</p>
                <p class="card-text">Available: {{ getAvailabilityText(bay) }}</p>
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
import { fetchCarParkDetails, bookBay, fetchBayAvailability } from '@/services/carParkService';

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
      pricing: null,
      creditCard: '',
      creditCardError: '',
      submitError: '', 
    };
  },
  
  computed: {
    isDepartureValid() {
      return !this.arrivalTime || !this.departureTime || new Date(this.departureTime) >= new Date(this.arrivalTime);
    },
    canSubmitBooking() {
      return this.isDepartureValid && this.selectedBay && this.creditCard && !this.creditCardError;
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
  watch: {
    async arrivalTime() {
      await this.checkAllBayAvailability();
    },
    async departureTime() {
      await this.checkAllBayAvailability();
    },
  },
  methods: {
    selectBay(bay) {
      this.selectedBay = this.selectedBay && this.selectedBay.bay_id === bay.bay_id ? null : bay;
    },
    formatCurrency(value) {
      return `£${parseFloat(value).toFixed(2)}`;
    },
    validateCreditCard() {
      const regex = new RegExp("^[0-9]{4} [0-9]{4} [0-9]{4} [0-9]{4}$");
      if (!this.creditCard) {
        this.creditCardError = 'Credit card number is required.';
      } else if (!regex.test(this.creditCard)) {
        this.creditCardError = 'Invalid credit card number. Format: 1234 5678 9012 3456';
      } else {
        this.creditCardError = ''; // Clear the error if the input is valid
      }
    },
    async checkAllBayAvailability() {
      if (this.arrivalTime && this.departureTime) {
        for (const bay of this.bays) {
          const availability = await fetchBayAvailability(bay.bay_id, this.arrivalTime, this.departureTime);
          bay.isAvailable = availability.isAvailable;
        }
      }
    },

    getAvailabilityText(bay) {
      if (!this.arrivalTime || !this.departureTime) {
        return 'Waiting...'; // Display this text when no times are selected
      }
      return bay.isAvailable ? 'Yes' : 'No';
    },

    async submitBooking() {
    this.submitError = ''; // Reset submitError on new submission attempt
    if (!this.canSubmitBooking) {
      alert("Please ensure all fields are correctly filled.");
      return;
    }

    const bookingData = {
      bayId: this.selectedBay.bay_id,
      carparkId: this.carparkId,
      startTime: this.arrivalTime,
      endTime: this.departureTime,
      cost: this.calculatedCost
    };

    try {
      await bookBay(bookingData);
      alert(`Booking successful`);
      // Reset the form or redirect the user as necessary
    } catch (error) {
      console.error('Error booking the bay:', error);
      // Directly use the error message if available
      this.submitError = error.message || "An unexpected error occurred.";
    }
  }
},
  async mounted() {
    try {
      const details = await fetchCarParkDetails(this.carparkId);
      this.carParkAddress = details.address;
      // Sort the bays by bay_number
      this.bays = details.bays.sort((a, b) => a.bay_number - b.bay_number);
      this.pricing = details.pricing;
    } catch (error) {
      console.error('Failed to load car park details:', error);
      alert('Failed to load car park details. Please try again later.');
    }
  }
};
</script>

<style scoped>
.hover-highlight:hover {
  background-color: #f8f9fa; 
}
.selected-bay .card {
  background-color: #f8f9fa;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
  width: 50% !important; /* Ensures width is set to 50% for centered alignment */
}

/* Adjustments for credit card input and button spacing */
#creditCard {
  width: 50% !important; /* Match the width of other input boxes */
  display: block; /* Ensures the input behaves as a block-level element */
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem; /* Adds space below the credit card input */
}

.btn-primary {
  display: block; /* Ensures the button behaves as a block-level element */
  margin: 0 auto; /* Centers the button and maintains the gap from the input above */
}
</style>