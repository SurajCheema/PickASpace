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
              <input type="datetime-local" id="departureTime" class="form-control date-picker" v-model="departureTime"
                :min="minDepartureTime">
              <div v-if="!isDepartureValid" class="text-danger">
                Departure time cannot be earlier than arrival time.
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Selected Bay</label>
            <p>{{ selectedBay ? `Bay ${selectedBay.bay_number}` : 'No bay selected' }}</p>
          </div>
          <div v-if="!isDepartureValid" class="text-danger">
            Departure time must be later than arrival time.
          </div>
          <div class="form-group">
            <label>Duration and Cost</label>
            <p v-if="stayDuration !== '-'">{{ stayDuration }} hours at {{ formatCurrency(calculatedCost) }}</p>
            <p v-else>{{ stayDuration }}</p>
          </div>
        </form>
      </div>
      <div class="col-md-2"></div>
      <div class="col-md-4 payment-section text-center">
        <div class="form-group">
          <h4>Payment Details</h4>
          <label>Card Number</label>
          <div id="card-number"></div> <!-- Stripe.js injects the Card Number Element -->
          <label>Card Expiry</label>
          <div id="card-expiry"></div> <!-- Stripe.js injects the Card Expiry Element -->
          <label>Card CVC</label>
          <div id="card-cvc"></div> <!-- Stripe.js injects the Card CVC Element -->
          <button @click.prevent="submitBooking"
            :disabled="!isDepartureValid || !selectedBay || !selectedBay.isAvailable" id="submit">
            <div class="spinner hidden" id="spinner"></div>
            <span id="button-text">Pay now</span>
          </button>
          <div v-if="loading" class="loading-spinner"></div>
          <p id="card-error" role="alert"></p>
          <p class="result-message" v-if="paymentSuccessful">
            Payment succeeded, see the result in your
            <a href="https://dashboard.stripe.com/test/payments" target="_blank">Stripe dashboard.</a> Refresh the page
            to pay again.
          </p>
        </div>
      </div>
    </div>
    <div class="row mt-5-bay-cards-row">
      <div class="col-12">
        <h4 class="col-12-h4">Available Bays</h4>
        <div class="row">
          <div class="col-md-3" v-for="bay in bays" :key="bay.bay_id"
            :class="{ 'selected-bay': selectedBay && selectedBay.bay_id === bay.bay_id }" @click="selectBay(bay)">
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

  <EVConfirmationModal :show="showModal" :message="modalMessage" @confirm="confirmModal" @cancel="cancelModal" />

</template>
<script>
import { fetchCarParkDetails, bookBay, fetchBayAvailability } from '@/services/carParkService';
import { loadStripe } from '@stripe/stripe-js';
import { getUserDetails } from '../services/userService';
import { fetchVehicleDetails } from '../services/vehicleService';
import EVConfirmationModal from '../components/EVConfirmationModal.vue';

export default {
  name: 'BayBooking',
  props: ['carparkId'],
  components: {
    EVConfirmationModal
  },
  data() {
    return {
      carParkAddress: '',
      bays: [],
      selectedBay: null,
      arrivalTime: '',
      departureTime: '',
      pricing: null,
      stripe: null, // Initialize stripe object
      cardNumberElement: null, // Initialize card number element
      cardExpiryElement: null, // Initialize card expiry element
      cardCvcElement: null,
      submitError: '',
      bookingSuccessMessage: '',
      paymentSuccessful: false,
      loading: false,
      showModal: false,
      modalMessage: ''
    };
  },

  computed: {
    isDepartureValid() {
      return this.arrivalTime && this.departureTime && new Date(this.departureTime) > new Date(this.arrivalTime);
    },
    minDepartureTime() {
      return this.arrivalTime;
    },
    stayDuration() {
      if (!this.arrivalTime || !this.departureTime || !this.isDepartureValid) {
        return "-";
      }
      return ((new Date(this.departureTime) - new Date(this.arrivalTime)) / (1000 * 60 * 60)).toFixed(2);
    },
    calculatedCost() {
      if (!this.selectedBay || !this.arrivalTime || !this.departureTime || !this.pricing || this.stayDuration === "-") {
        return "-";
      }

      const hours = parseFloat(this.stayDuration);
      const { hourly, daily, weekly, monthly } = this.pricing;

      const months = Math.floor(hours / (24 * 30));
      const weeks = Math.floor((hours % (24 * 30)) / (24 * 7));
      const days = Math.floor((hours % (24 * 7)) / 24);
      const remainingHours = hours % 24;

      let totalCost = (months * monthly) + (weeks * weekly) + (days * daily) + (remainingHours * hourly);
      const allHourlyCost = hours * hourly;
      return Math.min(totalCost, allHourlyCost);
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
    async selectBay(bay) {
      const details = await getUserDetails();
      this.user = { ...this.user, ...details };
      // Assuming there is a way to get the registration number of the vehicle trying to book
      const registrationNumber = this.user.car_registration.trim();
      console.log(registrationNumber);

      if (!registrationNumber) {
        alert("Vehicle registration number must be provided.");
        return;
      }

      try {
        // Fetch vehicle details from the DVLA via your server endpoint
        const response = await fetchVehicleDetails(this.user.car_registration);
        console.log(response);

        const fuelType = response.fuelType;
        console.log(fuelType);

        // Check if the selected bay has EV charging and if the vehicle is not electric
        if (bay.hasEVCharging && fuelType !== "ELECTRICITY") {
          this.modalMessage = "Your vehicle is not electric. Parking in a dedicated electric car charging bay can leave drivers of fuel-powered vehicles liable for a penalty charge notice. Do you want to take the risk anyway?";
          this.selectedBay = bay; // Store the selected bay
          this.showModal = true;
        } else {
          // The bay is either not for EVs or the car is electric, proceed to select the bay
          this.selectedBay = this.selectedBay && this.selectedBay.bay_id === bay.bay_id ? null : bay;
        }
      } catch (error) {
        console.error("Error selecting bay:", error);
        alert("There was an error processing your request. Please try again.");
      }
    },
    confirmModal() {
      // User confirmed to take the risk, select the bay
      this.showModal = false;
    },
    cancelModal() {
      // User canceled, clear the selected bay
      this.selectedBay = null;
      this.showModal = false;
    },
    formatCurrency(value) {
      if (value === "-") return value;
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
      const stripePromise = loadStripe(process.env.VUE_APP_STRIPE_PUBLIC_KEY);
      this.stripe = await stripePromise;
      const elements = this.stripe.elements();
      const style = {
        base: {
          color: "#32325d",
          fontSize: "16px", // Increase font size for better visibility
          '::placeholder': {
            color: '#aab7c4',
          },
          iconColor: '#c4f0ff',
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
        },
      };

      // Create separate elements for card details
      this.cardNumberElement = elements.create('cardNumber', { style });
      this.cardNumberElement.mount('#card-number');

      this.cardExpiryElement = elements.create('cardExpiry', { style });
      this.cardExpiryElement.mount('#card-expiry');

      this.cardCvcElement = elements.create('cardCvc', { style });
      this.cardCvcElement.mount('#card-cvc');
    },

    async submitBooking() {
      this.loading = true;

      if (!this.isDepartureValid || !this.selectedBay) {
        this.submitError = "Please ensure all fields are correctly filled.";
        console.error("Booking Error:", this.submitError);
        this.loading = false;
        return;
      }

      // Reset any existing errors
      this.submitError = '';

      // Create Stripe token
      const { token, error } = await this.stripe.createToken(this.cardNumberElement);
      if (error) {
        this.submitError = error.message;
        console.error("Stripe Error: Error creating Stripe token:", error.message);
        this.loading = false;
        return;
      }

      if (!token) {
        this.submitError = "Failed to create payment token.";
        console.error("Stripe Error: Stripe token creation failed without an error message.");
        this.loading = false;
        return;
      }

      console.log("Stripe Token Generated:", token.id); // Always log the Stripe token

      const amount = Math.round(this.calculatedCost * 100); // Convert pounds to pence
      console.log("Amount to charge (in pence):", amount); // Always log the amount to charge

      if (amount <= 0) {
        this.submitError = "Invalid amount to charge.";
        console.error("Charge Error:", this.submitError);
        this.loading = false;
        return;
      }

      const bookingData = {
        bayId: this.selectedBay.bay_id,
        carparkId: this.carparkId,
        startTime: this.arrivalTime,
        endTime: this.departureTime,
        cost: amount,
        stripeToken: token.id
      };

      try {
        const bookingResult = await bookBay(bookingData);
        if (bookingResult.message) {
          this.bookingSuccessMessage = `Successfully booked bay and charged. Booking ID: ${bookingResult.bookingId}`;
          this.paymentSuccessful = true;
          this.resetForm();
        } else {
          throw new Error('Booking was not successful', bookingResult);
        }
      } catch (error) {
        this.submitError = error.message || "An unexpected error occurred.";
        console.error("Booking Error:", this.submitError, error);
      }
      this.loading = false;
    },

    resetForm() {
      this.selectedBay = null;
      this.arrivalTime = '';
      this.departureTime = '';
      this.paymentSuccessful = false;
      if (this.cardElement) {
        this.cardElement.clear();
      }
    },
  },
  async mounted() {
    try {
      await this.fetchCarParkDetails();
      await this.initStripe();  // Initialise Stripe after loading details
    } catch (error) {
      console.error('Error during mounted lifecycle:', error);
      this.submitError = error.message || 'Failed to initialize component properly.';
    }
  }
};
</script>
<style scoped>
.loading-spinner {
  /* CSS for the loading spinner */
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #333;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.form-group {
  justify-content: center;
  align-items: center;
}

.hover-highlight:hover {
  background-color: #f8f9fa;
  /* Slight highlight on hover */
}

.selected-bay .card {
  background-color: #f8f9fa;
  /* Light background for selected bay */
}

.col-12-h4 {
  color: #ffffff;
  border-radius: 10px;
}

.date-picker {
  width: 100%;
  /* Ensure date pickers use full width of their container */
}

.booking-section,
.payment-section {
  padding-bottom: 2rem;
  /* Maintain space below each section */
}

.bay-cards-row {
  margin-top: 5rem;
  /* Increased vertical space from the forms */
  background-color: #79489c;
  /* Light blue background color for bay cards */
}

@media (min-width: 768px) {
  .form.control {
    width: 100%;
    /* Adjust if the date pickers still appear too large */
  }

  .form-section {
    margin-top: 3rem;
    /* Add more space between headers and forms */
  }
}

.col-md-6.text-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hidden {
  display: none;
}

#card-number,
#card-expiry,
#card-cvc {
  background-color: white;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 40px;
  /* Larger height for easier interaction */
}

#submit {
  margin-top: 20px;
  /* Space between the CVC input and the button /
background-color: #4CAF50;
/ Green background for visibility */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
}

#submit:disabled {
  background-color: #ccc;
  /* Gray out when disabled */
}
</style>