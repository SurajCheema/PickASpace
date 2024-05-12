<template>
  <div class="container mt-5">
    <h2 class="text-center"><span class="blue">Create a</span> New Car Park</h2>
    <form @submit.prevent="handleSubmit" class="form-container mt-4">
      
      <div class="card mb-4">
        <div class="card-body">
          <h4 class="card-title">Location Details</h4>
          <div class="row">
            <div class="col-md-6">
              <label for="addressLine1" class="form-label">Address Line 1:</label>
              <input type="text" class="form-control" id="addressLine1" v-model="carPark.addressLine1" required>
            </div>
            <div class="col-md-6">
              <label for="addressLine2" class="form-label">Address Line 2:</label>
              <input type="text" class="form-control" id="addressLine2" v-model="carPark.addressLine2">
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <label for="city" class="form-label">City:</label>
              <input type="text" class="form-control" id="city" v-model="carPark.city" required>
            </div>
            <div class="col-md-6">
              <label for="postcode" class="form-label">Postcode:</label>
              <input type="text" class="form-control" id="postcode" v-model="carPark.postcode" required>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <h4 class="card-title">Operational Times</h4>
          <div class="row">
            <div class="col-md-6">
              <label for="openTime" class="form-label">Open Time:</label>
              <input type="time" class="form-control" id="openTime" v-model="carPark.openTime" required>
            </div>
            <div class="col-md-6">
              <label for="closeTime" class="form-label">Close Time:</label>
              <input type="time" class="form-control" id="closeTime" v-model="carPark.closeTime" required>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <h4 class="card-title">Additional Information</h4>
          <label for="accessInstructions" class="form-label">Access Instructions:</label>
          <textarea class="form-control" id="accessInstructions" v-model="carPark.accessInstructions" rows="3"></textarea>
          <label for="totalBays" class="form-label mt-3">Total Number of Bays:</label>
          <input type="number" class="form-control" id="totalBays" v-model.number="totalBays" @change="updateBays" required>
        </div>
      </div>

      <!-- Bay cards -->
      <div class="row justify-content-center mb-3">
        <div v-for="(bay, index) in carPark.bays" :key="index" class="col-md-6 mb-4">
          <div class="card h-100 text-center p-2">
            <div class="card-body">
              <h5 class="card-title">Bay {{ bay.bay_number }}</h5>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="bay.hasEVCharging"
                  :id="'evCharging' + index">
                <label class="form-check-label" :for="'evCharging' + index">EV Charging</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="bay.disabled" :id="'disabled' + index">
                <label class="form-check-label" :for="'disabled' + index">Accessible</label>
              </div>
              <select class="form-select mt-2" v-model="bay.vehicleSize" :id="'vehicleSize' + index">
                <option value="Small">Small (e.g., VW Polo, Ford Fiesta)</option>
                <option value="Medium">Medium (e.g., Audi A3)</option>
                <option value="Large">Large (e.g., Volvo XC90)</option>
                <option value="Van & Minibus">Van & Minibus (e.g., Ford Sprinter)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Pricing -->
      <div class="row justify-content-center mb-4">
        <div class="col-md-6" v-for="(pricing) in ['Hourly', 'Daily', 'Weekly', 'Monthly']" :key="pricing">
          <div class="card text-center mb-3">
            <div class="card-header">{{ pricing }} Pricing</div>
            <div class="card-body">
              <div class="input-group">
                <span class="input-group-text">£</span>
                <input type="number" class="form-control" :placeholder="`£${getDefaultPrice(pricing)}`"
                  :aria-label="`${pricing} price`" v-model.number="carPark.pricing[pricing.toLowerCase()]"
                  step="0.01" min="0">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center mt-4">
        <button type="submit" class="btn btn-primary">Create Car Park</button>
      </div>
      <div v-if="errorMessages.length > 0" class="alert alert-danger mt-3">
        <ul>
          <li v-for="msg in errorMessages" :key="msg">{{ msg }}</li>
        </ul>
      </div>
    </form>
  </div>
</template>


<script>
import { reactive } from 'vue';
import { createCarPark } from '@/services/carParkService';

export default {
  data() {
    return {
      carPark: reactive({
        addressLine1: '',
        addressLine2: '',
        city: '',
        postcode: '',
        openTime: '',
        closeTime: '',
        accessInstructions: '',
        pricing: {
          hourly: 1.00,
          daily: 5.00,
          weekly: 25.00,
          monthly: 80.00,
        },
      }),
      errorMessages: [],
      successMessage: '',
    };
  },
  methods: {
    validateForm() {
      this.errorMessages = [];
      if (!this.carPark.addressLine1.trim()) {
        this.errorMessages.push("Address Line 1 is required.");
      }
      if (!this.carPark.city.trim()) {
        this.errorMessages.push("City is required.");
      }
      if (!this.carPark.postcode.trim()) {
        this.errorMessages.push("Postcode is required.");
      }
      if (!this.carPark.openTime.trim()) {
        this.errorMessages.push("Open Time is required.");
      }
      if (!this.carPark.closeTime.trim()) {
        this.errorMessages.push("Close Time is required.");
      }
      ['hourly', 'daily', 'weekly', 'monthly'].forEach(pricingType => {
        if (!this.carPark.pricing[pricingType]) {
          this.errorMessages.push(`${pricingType.charAt(0).toUpperCase() + pricingType.slice(1)} pricing is required.`);
        }
      });

      const pricingKeys = ['hourly', 'daily', 'weekly', 'monthly'];
      pricingKeys.forEach(key => {
        if (this.carPark.pricing[key] < 0) {
          this.errorMessages.push(`${key.charAt(0).toUpperCase() + key.slice(1)} pricing cannot be negative.`);
        }
      });

      return this.errorMessages.length === 0;
    },

    getDefaultPrice(pricing) {
      switch (pricing) {
        case 'Hourly': return '1.00';
        case 'Daily': return '5.00';
        case 'Weekly': return '25.00';
        case 'Monthly': return '80.00';
        default: return '0.00';
      }
    },
    updateBays() {
      const numberOfBays = parseInt(this.totalBays, 10) || 0;
      this.carPark.bays = Array.from({ length: numberOfBays }, (_, i) => ({
        bay_number: i + 1,
        hasEVCharging: false,
        disabled: false,
        // Default size
        vehicleSize: 'Large',
      }));
    },
    addBay() {
      this.carPark.bays.push({
        bay_number: '',
      });
    },
    async handleSubmit() {
      if (!this.validateForm()) return;

      try {
        await createCarPark(this.carPark);
        this.successMessage = 'Successfully created car park.';
        this.errorMessages = [];
        this.resetForm();
      } catch (error) {
        console.error('Error creating car park:', error);
        if (error.message === 'Stripe account not linked. Please complete the Stripe onboarding process.') {
          this.errorMessages.push('Stripe account not linked. Please complete the Stripe onboarding process.');
        } else if (error.message === 'Stripe account is not fully activated. Please complete any required steps in your Stripe dashboard.') {
          this.errorMessages.push('Stripe account is not fully activated. Please complete any required steps in your Stripe dashboard.');
        } else if (error.message === 'Failed to create car park. Please try again later.') {
          this.errorMessages.push('Failed to create car park. Please try again later.');
        } else {
          this.errorMessages.push('An error occurred while creating the car park. Please check the console for more details.');
        }
      }
    },

    // Reset form fields to their initial state
    resetForm() {
      this.carPark.addressLine1 = '';
      this.carPark.addressLine2 = '';
      this.carPark.city = '';
      this.carPark.postcode = '';
      this.carPark.openTime = '';
      this.carPark.closeTime = '';
      this.carPark.accessInstructions = '';
      this.carPark.pricing = {
        hourly: 0.91,
        daily: 4.05,
        weekly: 20.25,
        monthly: 33.27,
      };
      this.carPark.bays = []; // Clears bays
    },
  },
};
</script>
<style scoped>
.container {
  max-width: 960px; /* Adjust max width for larger screens */
  margin: 40px auto;
  padding: 20px;
  background: #ffffff; /* Start with a plain white to match the gradient start */
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-container {
  background: linear-gradient(to right, #ffffff, #b3d4fc); /* Gradient from white to light blue */
  border-radius: 8px;
  padding: 20px;
}

.card {
  background: #fff;
  border: 1px solid #ddd; /* Light border for definition */
  border-radius: 5px; /* Rounded corners for a softer look */
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); /* Subtle shadow for depth */
  transition: transform 0.3s ease-in-out; /* Smooth transformation on hover */
}

.card:hover {
  transform: scale(1.05); /* Slight scale to indicate interactivity */
}

.card-body {
  padding: 20px; /* Ample padding for content separation */
}

.form-check-input {
  margin-top: 0.3em; /* Align checkbox better with the text */
  cursor: pointer; /* Indicate that the checkbox is interactive */
}

.form-select {
  margin-top: 10px; /* Spacing above the select box */
  cursor: pointer; /* Indicate that the select is interactive */
}

@media (max-width: 767px) {
  .col-md-6 {
    max-width: 100%; /* Full width for small screens to ensure readability */
  }
}


.card-header {
  background-color: #e7eff9;
  color: #333;
  font-weight: bold;
}

.card-title {
  color: #333;
  margin-bottom: 15px;
}

.input-group-text {
  background-color: #dee2e6; /* Light gray background for input group */
}

@media (min-width: 768px) {
  .card {
    margin-bottom: 20px; /* Ensures consistent margin-bottom for all cards */
  }
}

.form-label {
  font-weight: bold;
  color: #555;
}

.form-control {
  border-radius: 4px;
  border: 1px solid #ccc;
  padding: 8px;
}

.btn-primary {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.btn-primary:hover {
  background-color: #45a049;
}

.green-text {
  color: #8707f7;
}

.error-messages > li {
  color: red;
  margin-bottom: 5px;
}

@media (min-width: 992px) {
  .container {
    width: 60%; /* Use 50% of the screen width on large screens */
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .container {
    width: 70%; /* Use 60% of the screen width on medium screens */
  }
}

@media (max-width: 767px) {
  .container {
    width: 100%; /* Use 100% of the screen width on small screens */
  }
}
</style>

