<template>
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <h2 class="text-center"><span class="green-text">Edit</span> Car Park</h2>
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
                <input type="number" class="form-control" id="totalBays" v-model.number="totalBays" @input="updateBays" required>
              </div>
            </div>
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
            <div v-if="successMessage" class="alert alert-success text-center" role="alert">
              {{ successMessage }}
            </div>
            <div class="text-center">
              <button type="submit" class="btn btn-primary">Save Changes</button>
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
  import { reactive, onMounted, ref } from 'vue';
  import { fetchCarParkDetails, updateCarPark } from '@/services/carParkService';
  import { useRoute } from 'vue-router';
  
  export default {
    setup() {
      const route = useRoute();
      const carparkId = route.params.carparkId;
  
      const carPark = reactive({
        addressLine1: '',
        addressLine2: '',
        city: '',
        postcode: '',
        openTime: '',
        closeTime: '',
        accessInstructions: '',
        pricing: {
          hourly: 0,
          daily: 0,
          weekly: 0,
          monthly: 0,
        },
        bays: [],
      });
  
      const errorMessages = ref([]);
      const successMessage = ref('');
      const totalBays = ref(0);
  
      onMounted(async () => {
        try {
          const fetchedCarPark = await fetchCarParkDetails(carparkId);
          Object.assign(carPark, fetchedCarPark);
          totalBays.value = carPark.bays.length;
        } catch (error) {
          console.error('Error fetching car park details:', error);
        }
      });
  
      function validateForm() {
        errorMessages.value = [];
        if (!carPark.addressLine1.trim()) {
          errorMessages.value.push("Address Line 1 is required.");
        }
        if (!carPark.city.trim()) {
          errorMessages.value.push("City is required.");
        }
        if (!carPark.postcode.trim()) {
          errorMessages.value.push("Postcode is required.");
        }
        if (!carPark.openTime.trim()) {
          errorMessages.value.push("Open Time is required.");
        }
        if (!carPark.closeTime.trim()) {
          errorMessages.value.push("Close Time is required.");
        }
        ['hourly', 'daily', 'weekly', 'monthly'].forEach(pricingType => {
          if (!carPark.pricing[pricingType]) {
            errorMessages.value.push(`${pricingType.charAt(0).toUpperCase() + pricingType.slice(1)} pricing is required.`);
          } else if (carPark.pricing[pricingType] < 0) {
            errorMessages.value.push(`${pricingType.charAt(0).toUpperCase() + pricingType.slice(1)} pricing cannot be negative.`);
          }
        });
  
        return errorMessages.value.length === 0;
      }
  
      function updateBays() {
        console.log('Updating bays...');
        const newBayCount = parseInt(totalBays.value, 10) || 0;
        console.log(`Requested number of bays: ${newBayCount}, Current number of bays: ${carPark.bays.length}`);
  
        if (newBayCount < carPark.bays.length) {
          console.log('Reducing number of bays');
          carPark.bays.splice(newBayCount);
        } else {
          console.log('Increasing number of bays');
          while (carPark.bays.length < newBayCount) {
            const newIndex = carPark.bays.length + 1;
            carPark.bays.push({
              bay_number: newIndex,
              hasEVCharging: false,
              disabled: false,
              vehicleSize: 'Large', // Default size for new bays
            });
            console.log(`Added bay ${newIndex}`);
          }
        }
        console.log(`Updated bays: ${JSON.stringify(carPark.bays)}`);
      }
  
      function getDefaultPrice(pricing) {
        switch (pricing) {
          case 'Hourly': return '1.00';
          case 'Daily': return '5.00';
          case 'Weekly': return '25.00';
          case 'Monthly': return '80.00';
          default: return '0.00';
        }
      }
  
      async function handleSubmit() {
        if (!validateForm()) return;
  
        try {
          await updateCarPark(carparkId, carPark);
          successMessage.value = 'Car park updated successfully.';
          errorMessages.value = [];
        } catch (error) {
          console.error('Error updating car park:', error);
          errorMessages.value.push('An error occurred while updating the car park. Please check the console for more details.');
        }
      }
  
      return {
        carPark,
        errorMessages,
        successMessage,
        totalBays,
        validateForm,
        getDefaultPrice,
        updateBays,
        handleSubmit,
      };
    },
  };
  </script>
  
  <style scoped>
  .green-text {
    color: #8707f7;
  }
  
  .error-messages>li {
    margin-bottom: 5px;
  }
  </style>
  