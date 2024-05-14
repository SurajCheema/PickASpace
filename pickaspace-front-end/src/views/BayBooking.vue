<template>
  <div class="container pt-4">
    <div class="row mb-4">
      <div class="col-12">
        <h1 class="text-center font-weight-bold">{{ carParkAddress }}</h1>
      </div>
    </div>
    <div class="row justify-content-center form-section">

      <!-- Booking Section -->
      <div class="col-md-5 booking-section">
        <h4 class="text-center section-title">Select Arrival and Departure Time</h4>
        <form>
          <div class="form-group">
            <label for="arrivalTime">Arrival Time</label>
            <input type="datetime-local" id="arrivalTime" class="form-control" v-model="arrivalTime">
          </div>
          <div class="form-group">
            <label for="departureTime">Departure Time</label>
            <input type="datetime-local" id="departureTime" class="form-control" v-model="departureTime" :min="minDepartureTime">
            <div v-if="!isDepartureValid" class="alert alert-danger">
              Departure time cannot be earlier than arrival time.
            </div>
          </div>
          <div class="form-group">
            <label>Selected Bay</label>
            <p>{{ selectedBay ? `Bay ${selectedBay.bay_number}` : 'No bay selected' }}</p>
          </div>
          <div class="form-group">
            <label>Duration and Cost</label>
            <p>{{ stayDuration !== '-' ? `${stayDuration} hours at ${formatCurrency(calculatedCost)}` : stayDuration }}</p>
          </div>
        </form>
      </div>

      <div class="col-1"></div>

      <!-- Payment Section -->
      <div class="col-md-5 payment-section">
        <h4 class="text-center section-title">Payment Details</h4>
        <div class="payment-container">
          <div class="payment-form-group">
            <label>Card Number</label>
            <div id="card-number" class="stripe-element"></div>
          </div>
          <div class="payment-form-group">
            <label>Card Expiry</label>
            <div id="card-expiry" class="stripe-element"></div>
          </div>
          <div class="payment-form-group">
            <label>Card CVC</label>
            <div id="card-cvc" class="stripe-element"></div>
          </div>
          <button @click.prevent="submitBooking"
            :disabled="!isDepartureValid || !selectedBay || !selectedBay.isAvailable" class="submit-button">
            Pay now
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
    <div class="row mt-5 bay-cards-row">
      <div class="col-12">
        <h4 class="text-center">Available Bays</h4>
        <div class="row">
          <div class="col-md-3" v-for="bay in bays" :key="bay.bay_id"
            :class="{ 'selected-bay': selectedBay && selectedBay.bay_id === bay.bay_id }" @click="selectBay(bay)">
            <div class="card mb-3 hover-highlight">
              <div class="card-body">
                <h3 class="card-title"><span class="blue">Bay</span> {{ bay.bay_number }}</h3>
                <p class="card-text"><span class="label blue">EV Charging:</span> {{ bay.hasEVCharging ? 'Yes' : 'No' }}</p>
                <p class="card-text"><span class="label blue">Disabled Access:</span> {{ bay.disabled ? 'Yes' : 'No' }}</p>
                <p class="card-text"><span class="label blue">Available:</span> {{ getAvailabilityText(bay) }}</p>
                <p class="card-text"><span class="label blue">Vehicle Size:</span> {{ bay.vehicleSize }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <CombinedBayConfirmationModal :show="combinedModalShow" :message="combinedModalMessage"
    @confirm="confirmCombinedModal" @cancel="cancelCombinedModal" />
</template>


<script>
import { fetchCarParkDetails, bookBay, fetchBayAvailability } from '@/services/carParkService';
import { loadStripe } from '@stripe/stripe-js';
import { getUserDetails } from '../services/userService';
import { fetchVehicleDetails } from '../services/vehicleService';
import CombinedBayConfirmationModal from '../components/CombinedBayConfirmationModal.vue';

export default {
  name: 'BayBooking',
  props: ['carparkId'],
  components: {
    CombinedBayConfirmationModal
  },
  data() {
    return {
      carParkAddress: '',
      bays: [],
      selectedBay: null,
      arrivalTime: '',
      departureTime: '',
      pricing: null,
      stripe: null, // Initialise stripe object
      cardNumberElement: null, // Initialise card number element
      cardExpiryElement: null, // Initialise card expiry element
      cardCvcElement: null,
      submitError: '',
      bookingSuccessMessage: '',
      paymentSuccessful: false,
      loading: false,
      combinedModalShow: false,
      combinedModalMessage: '',
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
  const cost = Math.min(totalCost, allHourlyCost);
  
  const processingFee = 0.30; // Add the £0.30 processing fee
  
  return cost + processingFee;
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

      const registrationNumber = this.user.car_registration.trim();
      if (!registrationNumber) {
        alert("Vehicle registration number must be provided.");
        return;
      }

      try {
        const response = await fetchVehicleDetails(registrationNumber);
        const fuelType = response.fuelType;

        if (bay.hasEVCharging && fuelType !== "ELECTRICITY" && bay.disabled && !this.user.blueBadge) {
          // Both EV charging and disabled access required
          this.combinedModalMessage = "Your vehicle is not electric, and you do not have a blue badge. Parking in this bay can leave you liable for a penalty charge notice.";
          this.selectedBay = bay;
          this.combinedModalShow = true;
        } else if (bay.hasEVCharging && fuelType !== "ELECTRICITY") {
          // Only EV charging required
          this.combinedModalMessage = "Your vehicle is not electric. Parking in a dedicated electric car charging bay can leave drivers of fuel-powered vehicles liable for a penalty charge notice.";
          this.selectedBay = bay;
          this.combinedModalShow = true;
        } else if (bay.disabled && !this.user.blueBadge) {
          // Only disabled access required
          this.combinedModalMessage = "You do not have a blue badge. Anyone parked in an enforceable bay and not displaying a valid blue badge may receive a penalty charge notice.";
          this.selectedBay = bay;
          this.combinedModalShow = true;
        } else {
          // No special requirements
          this.selectedBay = this.selectedBay && this.selectedBay.bay_id === bay.bay_id ? null : bay;
        }
        console.log("Modal message set to:", this.combinedModalMessage);
      } catch (error) {
        console.error("Error selecting bay:", error);
        alert("There was an error processing your request. Please try again.");
      }
    },

    confirmCombinedModal() {
      // User confirmed to take the risk, select the bay
      this.combinedModalShow = false;
    },
    cancelCombinedModal() {
      // User canceled, clear the selected bay
      this.selectedBay = null; // Deselect the bay
      this.combinedModalShow = false;
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

      const amount = Math.round(this.calculatedCost); // Keep the cost in pounds
      console.log("Amount to charge (in pounds):", amount); // Always log the amount to charge

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

.col-md-5.text-center {
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

.bay-cards-row {
  margin-top: 2rem; /* Add space above the bay cards section for better visual separation */
  padding: 1rem; /* Padding around the card container for better spacing */
  background-color: #f4f4f4; /* Neutral background to highlight the cards */
}

.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; /* Smooth transition for hover effects */
  cursor: pointer; /* Indicates that the cards are interactive */
  border: 1px solid #ddd; /* Subtle border for each card */
  border-radius: 8px; /* Rounded corners for a modern look */
  background-color: #ffffff; /* White background for each card */
}

.card:hover {
  transform: scale(1.05); /* Slightly enlarge the card on hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Add shadow to lift the card visually */
}

.card-body {
  padding: 1rem; /* Padding inside the card for content */
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content vertically for better alignment */
}

.card-title {
  color: #333; /* Dark color for the title for better readability */
  margin-bottom: 0.5rem; /* Space below the title */
}

.card-text {
  font-size: 0.9rem; /* Smaller font size for details */
  color: #666; /* Lighter text color for less emphasis on details */
  margin-bottom: 0.25rem; /* Reduce margin for compact appearance */
}

.selected-bay .card {
  border-color: #007bff; /* Blue border for selected bay */
  background-color: #e7f1ff; /* Light blue background for selected bay */
}

.label {
  font-weight: bold;
  font-size: medium;
}

.payment-section {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-top: 1rem; /* Space from other content */
}

.payment-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center align the elements */
}

.payment-form-group {
  margin-bottom: 1rem; /* Space between form groups */
  width: 100%; /* Full width for alignment */
}

.stripe-element {
  background-color: #f4f4f4; /* Slightly off-white for the input backgrounds */
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
  width: calc(100% - 20px); /* Full width minus padding */
}

.submit-button {
  background-color: #4CAF50; /* Primary action color */
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #333;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.result-message a {
  color: #007bff;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.booking-section {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.section-title {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: #0056b3; /* Consistent blue color across all section titles */
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
  padding: 0.75rem 1.25rem;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
}

.selected-bay-info, .cost-info {
  font-size: 1rem;
  font-weight: bold;
  color: #284777; /* Dark blue for important info */
}
</style>