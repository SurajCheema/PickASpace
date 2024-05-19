<template>
  <div class="container mt-5">
    <h2 class="text-center"><span class="blue">Edit</span> Car Park</h2>
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
              <label for="city" class="form-label" id="city">City:</label>
              <input type="text" class="form-control" v-model="carPark.city" required>
            </div>
            <div class="col-md-6">
              <label for="postcode" class="form-label" id="postcode">Postcode:</label>
              <input type="text" class="form-control" v-model="carPark.postcode" required>
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
          <input type="number" class="form-control" id="totalBays" v-model.number="totalBays" @input="updateBays" required>
        </div>
      </div>

      <!-- Bay cards -->
      <div class="row justify-content-center mb-3">
        <div v-for="(bay, index) in carPark.bays" :key="index" class="col-md-6 mb-4">
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

      <!-- Pricing -->
      <div class="row justify-content-center mb-4">
        <div class="col-md-6" v-for="(pricing) in ['Hourly', 'Daily', 'Weekly', 'Monthly']" :key="pricing">
          <div class="card text-center mb-3">
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
      <div v-if="successMessage" class="alert alert-success text-center mt-4" role="alert">
        {{ successMessage }}
      </div>
      <div class="text-center mt-4">
        <button type="submit" class="btn btn-primary">Save Changes</button>
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
        hourly: 1.00,
        daily: 5.00,
        weekly: 25.00,
        monthly: 80.00,
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
      const newBayCount = parseInt(totalBays.value, 10) || 0;

      if (newBayCount < carPark.bays.length) {
        carPark.bays.splice(newBayCount);
      } else {
        while (carPark.bays.length < newBayCount) {
          const newIndex = carPark.bays.length + 1;
          carPark.bays.push({
            bay_number: newIndex,
            hasEVCharging: false,
            disabled: false,
            vehicleSize: 'Large',
          });
        }
      }
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
.container {
  max-width: 960px;
  margin: 40px auto;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-container {
  background: linear-gradient(to right, #ffffff, #b3d4fc);
  border-radius: 8px;
  padding: 20px;
}

.card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease-in-out;
}

.card:hover {
  transform: scale(1.05);
}

.card-body {
  padding: 20px;
}

.form-check-input {
  margin-top: 0.3em;
  cursor: pointer;
}

.form-select {
  margin-top: 10px;
  cursor: pointer;
}

@media (max-width: 767px) {
  .col-md-6 {
    max-width: 100%;
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
  background-color: #dee2e6;
}

@media (min-width: 768px) {
  .card {
    margin-bottom: 20px;
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

.blue {
  color: #007bff;
}

.error-messages > li {
  color: red;
  margin-bottom: 5px;
}

@media (min-width: 992px) {
  .container {
    width: 60%;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .container {
    width: 70%;
  }
}

@media (max-width: 767px) {
  .container {
    width: 100%;
  }
}

#city {
  margin-top: 20px; /* Adds spacing above the City field */
}

#postcode {
  margin-top: 20px; /* Adds spacing above the Postcode field */
}
</style>
