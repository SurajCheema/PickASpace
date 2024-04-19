<template>
  <div class="container pt-4">
    <div class="row mb-4">
      <div class="col-12">
        <h1 class="text-center font-weight-bold">{{ carParkAddress }}</h1>
      </div>
    </div>
    <div class="row justify-content-center form-section">
      <div class="col-md-4 booking-section">
        <h4 class="text-center">Select Arrival and Departure Time</h4>
        <form>
          <div class="row">
            <div class="col-6 form-group">
              <label for="arrivalTime">Arrival Time</label>
              <input type="datetime-local" id="arrivalTime" class="form-control date-picker" v-model="arrivalTime">
            </div>
            <div class="col-6 form-group">
              <label for="departureTime">Departure Time</label>
              <input type="datetime-local" id="departureTime" class="form-control date-picker" v-model="departureTime" :min="minDepartureTime">
              <div v-if="!isDepartureValid" class="text-danger">
                Departure time cannot be earlier than arrival time.
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Selected Bay</label>
            <p>{{ selectedBay ? `Bay ${selectedBay.bay_number}` : 'No bay selected' }}</p>
          </div>
          <div class="form-group">
            <label>Duration and Cost</label>
            <p>{{ stayDuration }} hours at {{ formatCurrency(calculatedCost) }}</p>
          </div>
        </form>
      </div>
      <div class="col-md-2"></div>
      <div class="col-md-4 payment-section text-center">
        <div class="form-group">
          <h4>Payment Details</h4>
          <div id="card-element"><!--Stripe.js injects the Card Element--></div>
          <button @click.prevent="submitBooking" :disabled="!isDepartureValid || !selectedBay" id="submit">
            <div class="spinner hidden" id="spinner"></div>
            <span id="button-text">Pay now</span>
          </button>
          <p id="card-error" role="alert"></p>
          <p class="result-message hidden">
            Payment succeeded, see the result in your
            <a href="" target="_blank">Stripe dashboard.</a> Refresh the page to pay again.
          </p>
        </div>
      </div>
    </div>
    <div class="row mt-5 bay-cards-row"> 
      <div class="col-12">
        <h4>Available Bays</h4>
        <div class="row">
          <div class="col-md-3" v-for="bay in bays" :key="bay.bay_id" :class="{ 'selected-bay': selectedBay && selectedBay.bay_id === bay.bay_id }" @click="selectBay(bay)">
            <div class="card mb-3 hover-highlight">
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
import { loadStripe } from '@stripe/stripe-js';

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
      stripe: null, // Initialize stripe object
      cardElement: null, // Reference to the card element
      submitError: '', 
      bookingSuccessMessage: '',
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
      return !this.arrivalTime || !this.departureTime ? 0 : ((new Date(this.departureTime) - new Date(this.arrivalTime)) / (1000 * 60 * 60)).toFixed(2);
    },
    calculatedCost() {
      return !this.selectedBay || !this.arrivalTime || !this.departureTime ? 0 : (this.stayDuration * this.pricing.hourlyRate);
    }
  },

  watch: {
    async arrivalTime(newVal, oldVal) {
      if (newVal !== oldVal) {
        await this.checkAllBayAvailability();
      }
    },
    async departureTime(newVal, oldVal) {
      if (newVal !== oldVal) {
        await this.checkAllBayAvailability();
      }
    },
  },

  methods: {
    selectBay(bay) {
      this.selectedBay = this.selectedBay && this.selectedBay.bay_id === bay.bay_id ? null : bay;
    },
    formatCurrency(value) {
      return `£${parseFloat(value).toFixed(2)}`;
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
    async fetchCarParkDetails() {
      const details = await fetchCarParkDetails(this.carparkId);
      this.carParkAddress = details.address;
      this.bays = details.bays.sort((a, b) => a.bay_number - b.bay_number);
      this.pricing = details.pricing;
    },
    async initStripe() {
      const stripePromise = loadStripe('your-publishable-key');
      this.stripe = await stripePromise;
      const elements = this.stripe.elements();
      const style = {
        base: {
          color: "#32325d",
        },
      };
      this.cardElement = elements.create("card", { style: style });
      this.cardElement.mount("#card-element");
    },
    async submitBooking() {
  if (!this.isDepartureValid || !this.selectedBay) {
    this.submitError = "Please ensure all fields are correctly filled.";
    return;
  }
  const { token, error } = await this.stripe.createToken(this.cardElement);
  if (error) {
    this.submitError = error.message;
    return;
  }
  const bookingData = {
    bayId: this.selectedBay.bay_id,
    carparkId: this.carparkId,
    startTime: this.arrivalTime,
    endTime: this.departureTime,
    cost: this.calculatedCost,
    stripeToken: token.id
  };
  try {
    await bookBay(bookingData);
    this.bookingSuccessMessage = 'Successfully booked bay and charged';
    this.resetForm();
  } catch (error) {
    this.submitError = error.message || "An unexpected error occurred.";
  }
},



    resetForm() {
      this.selectedBay = null;
      this.arrivalTime = '';
      this.departureTime = '';
      if (this.cardElement) {
        this.cardElement.clear();
      }
    },
  },
  async mounted() {
    try {
      await this.fetchCarParkDetails();
      await this.initStripe();  // Initialize Stripe after loading details
    } catch (error) {
      console.error('Error during mounted lifecycle:', error);
      this.submitError = error.message || 'Failed to initialize component properly.';
    }
  }
};
</script>

<style scoped>
.hover-highlight:hover {
  background-color: #f8f9fa; /* Slight highlight on hover */
}
.selected-bay .card {
  background-color: #f8f9fa; /* Light background for selected bay */
}
.date-picker {
  width: 100%; /* Ensure date pickers use full width of their container */
}
.booking-section, .payment-section {
  padding-bottom: 2rem; /* Maintain space below each section */
}
.bay-cards-row {
  margin-top: 5rem; /* Increased vertical space from the forms */
  background-color: #e6f7ff; /* Light blue background color for bay cards */
}
@media (min-width: 768px) {
  .form-control {
    width: 100%; /* Adjust if the date pickers still appear too large */
  }
  .form-section {
    margin-top: 3rem; /* Add more space between headers and forms */
  }
}
.col-md-6.text-center {
  display: flex;
  flexDirection: column;
  justifyContent: center;
}
</style>