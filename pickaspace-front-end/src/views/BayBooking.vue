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
        <p class="text-success" v-if="bookingSuccessMessage">{{ bookingSuccessMessage }}</p>
        <div v-if="selectedBay"> <!-- Ensure selectedBay is not null before rendering this block -->
          <p>Selected Bay: {{ selectedBay?.bay_number }}</p> <!-- Safe navigation operator -->
          <p>Duration: {{ stayDuration }} hours</p>
          <p>Cost: {{ formatCurrency(calculatedCost) }}</p>
          <div class="form-group">
            <label for="card-element">Credit Card Details</label>
            <div id="card-element">
              <!-- Stripe's card element will be mounted here -->
            </div>
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
import { fetchCarParkDetails, bookBay, fetchBayAvailability, createCharge } from '@/services/carParkService';
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
      creditCard: '',
      creditCardError: '',
      submitError: '', 
      bookingSuccessMessage: '',
      stripe: null,
      cardElement: null
    };
  },

  async mounted() {
    this.stripe = await loadStripe('pk_test_51P6fSLERwTf2Nnasg0jbO25qmSs5gf1US5jDDihTMMsxdIGZIssiWpEWZX7s1Gi9EBdKqWpZM43Uc87ILqbx9Yze00jHcaDNVe');
    const elements = this.stripe.elements();

    try {
      const details = await fetchCarParkDetails(this.carparkId);
      this.carParkAddress = details.address;
      this.bays = details.bays.sort((a, b) => a.bay_number - b.bay_number);
      this.pricing = details.pricing;
    } catch (error) {
      console.error('Failed to load car park details:', error);
      this.submitError = 'Failed to load car park details. Please try again later.';
    }
  },

  methods: {
    initStripeElement() {
      if (!this.cardElement) { // Ensure initialize Stripe only once
        const elements = this.stripe.elements();
        this.cardElement = elements.create('card');
        this.cardElement.mount('#card-element');
      }
    },

    selectBay(bay) {
      this.selectedBay = this.selectedBay && this.selectedBay.bay_id === bay.bay_id ? null : bay;
      if (this.selectedBay) {
        this.$nextTick(() => {
          this.initStripeElement();
        });
      }
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
        this.creditCardError = '';
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
        return 'Waiting...';
      }
      return bay.isAvailable ? 'Yes' : 'No';
    },
    async submitBooking() {
      this.submitError = '';
      if (!this.canSubmitBooking) {
        this.submitError = "Please ensure all fields are correctly filled.";
        return;
      }
      try {
        const {paymentMethod, error} = await this.stripe.createPaymentMethod('card', this.cardElement);
        if (error) {
          this.submitError = error.message;
          return;
        }
        const paymentResult = await createCharge({
          paymentMethodId: paymentMethod.id,
          amount: Math.round(this.calculatedCost * 100) // Convert to pence
        });
        if (paymentResult && paymentResult.status === 'succeeded') {
          const bookingResult = await bookBay({
            bayId: this.selectedBay.bay_id,
            carparkId: this.carparkId,
            startTime: this.arrivalTime,
            endTime: this.departureTime,
            cost: this.calculatedCost
          });
          if (bookingResult.success) {
            this.bookingSuccessMessage = `Payment and booking successful. Booking ID: ${bookingResult.id}`;
            this.resetForm();
          } else {
            this.submitError = "Booking was not successful.";
          }
        } else {
          this.submitError = "Payment was not successful.";
        }
      } catch (error) {
        console.error('Error during the booking process:', error);
        this.submitError = error.message || "An unexpected error occurred during booking.";
      }
    },
    resetForm() {
      this.selectedBay = null;
      this.arrivalTime = '';
      this.departureTime = '';
      this.creditCard = '';
      this.creditCardError = '';
      this.submitError = '';
      this.fetchCarParkDetails();
    },
  }
};
</script>

<style scoped>
  /*  Styles remain the same */
</style>

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