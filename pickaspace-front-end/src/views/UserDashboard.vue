<template>
  <div class="container mt-5">
    <div class="input-group mb-3">
      <input type="text" class="form-control" placeholder="Search by address..." v-model="searchQuery" @input="fetchCarParks">
      <div class="input-group-append">
        <button class="btn btn-outline-secondary" type="button" @click="fetchCarParks">Search</button>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md-6" v-for="carPark in filteredCarParks" :key="carPark.carpark_id">
        <div class="card mb-3 hover-highlight" style="cursor:pointer" @click="selectCarPark(carPark)">
          <div class="card-body">
            <h5 class="card-title">{{ carPark.addressLine1 }}</h5>
            <p class="card-text">{{ carPark.city }}, {{ carPark.postcode }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="selectedCarPark" class="car-park-details mt-5">
      <h2>Car Park Details</h2>
      <p><strong>Address:</strong> {{ selectedCarPark.addressLine1 }}, {{ selectedCarPark.city }}, {{ selectedCarPark.postcode }}</p>
      <p><strong>Open Time:</strong> {{ selectedCarPark.openTime }}</p>
      <p><strong>Close Time:</strong> {{ selectedCarPark.closeTime }}</p>
      <p><strong>Access Instructions:</strong> {{ selectedCarPark.accessInstructions }}</p>
      <p><strong>Number of Bays:</strong> {{ selectedCarPark.bays?.length || 'N/A' }}</p>
      <button class="btn btn-primary" @click="bookCarPark">Book Car Park</button>
    </div>

    <!-- Modal for Car Park Details -->
    <div v-if="showModal" class="modal" tabindex="-1" role="dialog" style="display: block;">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Car Park Details</h5>
            <button type="button" class="close" @click="closeModal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p><strong>Address:</strong> {{ selectedCarPark.addressLine1 }}, {{ selectedCarPark.city }}, {{ selectedCarPark.postcode }}</p>
            <p><strong>Open Time:</strong> {{ selectedCarPark.openTime }}</p>
            <p><strong>Close Time:</strong> {{ selectedCarPark.closeTime }}</p>
            <p><strong>Access Instructions:</strong> {{ selectedCarPark.accessInstructions }}</p>
            <p><strong>Number of Bays:</strong> {{ selectedCarPark.bays?.length || 'N/A' }}</p>
            <!-- You can extend this with more details or actions -->
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import { fetchCarParks } from '@/services/carParkService';
export default {
  name: 'UserDashboard',
  data() {
    return {
      searchQuery: '', // Search query string
      carParks: [], // Array to hold car parks fetched from the backend
      selectedCarPark: null, // Object to hold the currently selected car park details
      bays: [], // Placeholder array for car park bays, to be filled once fetched from the backend
      showModal: false, 
    };
  },
  computed: {
    filteredCarParks() {
    return this.carParks.filter(carPark =>
      carPark.addressLine1.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (carPark.addressLine2 && carPark.addressLine2.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      carPark.city.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      carPark.postcode.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  },
},
methods: {
    async fetchCarParks() {
      const searchParams = new URLSearchParams({ query: this.searchQuery }).toString();
      try {
        const carParks = await fetchCarParks(searchParams);
        this.carParks = carParks;
      } catch (error) {
        alert('Failed to fetch car parks. Please try again later.');
      }
    },
    selectCarPark(carPark) {
      this.selectedCarPark = carPark;
      this.showModal = true; // Correctly placed inside methods
    },
    closeModal() {
      this.showModal = false; // Correctly placed inside methods
    },
    bookCarPark() {
      alert('Booking logic goes here.');
    },
  },
  mounted() {
    this.fetchCarParks();
  },
};
</script>

<style scoped>
.hover-highlight:hover {
  background-color: #f8f9fa;
}
</style>
