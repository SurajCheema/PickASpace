<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h2 class="text-center">Create a New Car Park</h2>
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
  
      <div v-for="(bay, index) in carPark.bays" :key="index" class="mb-3">
            <div class="text-center mb-2">
            <h4>Bay {{ bay.bay_number }}</h4>
            </div>
            <div class="d-flex justify-content-center align-items-center mb-2">
            <div class="form-check me-2">
                <input class="form-check-input" type="checkbox" v-model="bay.hasEVCharging" :id="'evCharging'+index">
                <label class="form-check-label" :for="'evCharging'+index">EV Charging</label>
            </div>
            <div class="form-check ms-2">
                <input class="form-check-input" type="checkbox" v-model="bay.disabled" :id="'disabled'+index">
                <label class="form-check-label" :for="'disabled'+index">Accessible</label>
            </div>
            </div>
            <div class="d-flex justify-content-center">
            <div class="col-md-5"> 
                <select class="form-select" v-model="bay.vehicleSize" :id="'vehicleSize'+index">
                <option value="Small">Small (e.g., VW Polo, Ford Fiesta)</option>
                <option value="Medium">Medium (e.g., Audi A3)</option>
                <option value="Large">Large (e.g., Volvo XC90)</option>
                <option value="Van & Minibus">Van & Minibus (e.g., Ford Sprinter)</option>
                </select>
            </div>
        </div>
     </div>  

  
            <div class="text-center">
              <button type="submit" class="btn btn-primary">Create Car Park</button>
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
        }),
      };
    },
    methods: {
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
        try {
          await createCarPark(this.carPark);
          alert('Car park created successfully!');
        } catch (error) {
          console.error('Error creating car park:', error);
          alert('Failed to create car park. Please try again later.');
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /*CSS styles here */
  </style>
  


  