<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h2 class="text-center"><span class="green-text">Create a</span> New Car Park</h2>
        <form @submit.prevent="handleSubmit" class="mt-4">
         
        <div class="row g-3 mb-3 justify-content-center">
            <div class="col-md-4">
                <label for="addressLine1" class="form-label">Address Line 1:</label>
                <input type="text" class="form-control" id="addressLine1" v-model="carPark.addressLine1" required>
            </div>
            <div class="col-md-4">
                <label for="addressLine2" class="form-label">Address Line 2:</label>
                <input type="text" class="form-control" id="addressLine2" v-model="carPark.addressLine2">
            </div>
        </div>
        <div class="row g-3 mb-3 justify-content-center">
            <div class="col-md-4">
                <label for="city" class="form-label">City:</label>
                <input type="text" class="form-control" id="city" v-model="carPark.city" required>
            </div>
            <div class="col-md-4">
                <label for="postcode" class="form-label">Postcode:</label>
                <input type="text" class="form-control" id="postcode" v-model="carPark.postcode" required>
            </div>
        </div>
  
          <div class="row g-3 mb-3 justify-content-center">
            <div class="col-md-4">
              <label for="openTime" class="form-label">Open Time:</label>
              <input type="time" class="form-control" id="openTime" v-model="carPark.openTime" required>
            </div>
            <div class="col-md-4">
              <label for="closeTime" class="form-label">Close Time:</label>
              <input type="time" class="form-control" id="closeTime" v-model="carPark.closeTime" required>
            </div>
          </div>
          
          <div class="mb-3">
            <label for="accessInstructions" class="form-label">Access Instructions:</label>
            <textarea class="form-control" id="accessInstructions" v-model="carPark.accessInstructions" rows="3"></textarea>
          </div>

          <div class="row mb-3 justify-content-center">
            <div class="col-md-4">
              <label for="totalBays" class="form-label">Total Number of Bays:</label>
              <input type="number" class="form-control" id="totalBays" v-model.number="totalBays" @change="updateBays" required>
            </div>
          </div>

  <!-- Pricing -->
        <div class="row justify-content-center mb-4">
            <div class="col-md-3" v-for="pricing in ['Hourly', 'Daily', 'Weekly', 'Monthly']" :key="pricing">
            <div class="card text-center">
                <div class="card-header">{{ pricing }} Pricing</div>
                <div class="card-body">
                    <div class="input-group">
                <span class="input-group-text">£</span>
                <input type="number" class="form-control" :placeholder="`£${getDefaultPrice(pricing)}`" :aria-label="`${pricing} price`" v-model.number="carPark.pricing[pricing.toLowerCase()]" step="0.01" min="0">
                </div>
            </div>
            </div>
        </div>
        </div>
  
              <!-- Bay cards -->
            <div class="row justify-content-center mb-3">
          <div v-for="(bay, index) in carPark.bays" :key="index" class="col-6 col-md-3 mb-4">
            <div class="card h-100 text-center p-2">
              <div class="card-body">
                <h5 class="card-title">Bay {{ bay.bay_number }}</h5>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="bay.hasEVCharging" :id="'evCharging' + index">
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
              <!-- Success Message -->
            <div v-if="successMessage" class="alert alert-success text-center" role="alert">
              {{ successMessage }}
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-primary">Create Car Park</button>
            </div>
            <div v-if="errorMessages.length > 0" class="alert alert-danger mt-3">
              <ul>
                <li v-for="msg in errorMessages" :key="msg">{{ msg }}</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
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
          hourly: 0.91,
          daily: 4.05,
          weekly: 20.25,
          monthly: 33.27,
        },
        }),
        errorMessages: [],
        successMessage: '',
      };
    },
    methods:  {
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
        case 'Hourly': return '0.91';
        case 'Daily': return '4.05';
        case 'Weekly': return '20.25';
        case 'Monthly': return '33.27';
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
        if (!this.validateForm()) {
          return;
        }
        try {
          await createCarPark(this.carPark);
          this.successMessage = 'Successfully created car park.'; // Set success message
          this.errorMessages = []; // Clear any previous error messages

          // Clear the form by resetting carPark data to its initial state
          this.resetForm();
        } catch (error) {
          console.error('Error creating car park:', error);
          this.errorMessages.push('Failed to create car park. Please try again later.');
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
 .green-text{
  color: #8707f7;
 }

 .error-messages > li {
  margin-bottom: 5px; /* Adds a tiny gap between each error message */
}
  </style>
  


  