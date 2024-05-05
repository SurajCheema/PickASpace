<template>
  <div class="container mt-5">
    <div class="input-group mb-3">
      <input type="text" class="form-control" placeholder="Search by address..." v-model="searchQuery"
        @input="fetchCarParks">
      <div class="input-group-append">
        <button class="btn btn-outline-secondary" type="button" @click="fetchCarParks">Search</button>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="card mb-3">
          <div class="card-body">
            <GoogleMap
              :center="mapCenter"
              :markers="mapMarkers"
              @marker-click="selectCarPark"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md-4" v-for="carPark in filteredCarParks" :key="carPark.carpark_id">
        <div class="card mb-3 hover-highlight" style="cursor:pointer" @click="selectCarPark(carPark)">
          <div class="card-body">
            <h5 class="card-title">{{ carPark.addressLine1 }}</h5>
            <p class="card-text">{{ carPark.city }}, {{ carPark.postcode }}</p>
          </div>
        </div>
      </div>
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
            <p><strong>Address:</strong> {{ selectedCarPark.addressLine1 }}, {{ selectedCarPark.addressLine2 }}, {{
        selectedCarPark.city }}, {{ selectedCarPark.postcode }}</p>
            <p><strong>Open Time:</strong> {{ selectedCarPark.openTime }}</p>
            <p><strong>Close Time:</strong> {{ selectedCarPark.closeTime }}</p>
            <p><strong>Access Instructions:</strong> {{ selectedCarPark.accessInstructions }}</p>
            <p><strong>Total Number of Bays:</strong> {{ selectedCarPark.bays.length }}</p>
            <p><strong>Number of Bays with EV Charging:</strong> {{ selectedCarPark.baysWithEVCharging }}</p>
            <p><strong>Number of Bays with Disabled Access:</strong> {{ selectedCarPark.baysWithDisabledAccess || 'N/A'
              }}</p>
            <p><strong>Largest Vehicle Size:</strong> {{ selectedCarPark.largestVehicleSize }}</p>
            <!-- Pricing details for car park -->
            <div class="text-center"> <!-- This centers all text within -->
              <h6><strong>Pricing:</strong></h6>
              <ul class="list-unstyled"> <!-- Removes bullet points -->
                <li><strong>Hourly:</strong> £{{ selectedCarPark.pricing.hourly.toFixed(2) }}</li>
                <li><strong>Daily:</strong> £{{ selectedCarPark.pricing.daily.toFixed(2) }}</li>
                <li><strong>Weekly:</strong> £{{ selectedCarPark.pricing.weekly.toFixed(2) }}</li>
                <li><strong>Monthly:</strong> £{{ selectedCarPark.pricing.monthly.toFixed(2) }}</li>
              </ul>
            </div>
            <button class="btn btn-primary" @click="bookCarPark">Book Car Park</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchCarParks, fetchCarParkBays } from '@/services/carParkService';
import GoogleMap from '@/components/GoogleMap.vue';

const vehicleSizeMapping = {
  "Small": 1,
  "Medium": 2,
  "Large": 3,
  "Van & Minibus": 4
};

// Reverse mapping to get the size name from the value
const vehicleSizeName = {
  1: "Small",
  2: "Medium",
  3: "Large",
  4: "Van & Minibus"
};

export default {
  name: 'UserDashboard',
  components: {
    GoogleMap,
  },
  data() {
    return {
      searchQuery: '',
      carParks: [],
      selectedCarPark: null,
      bays: [],
      showModal: false,
      mapCenter: { lat: 51.5074, lng: -0.1278 },
      mapMarkers: [],
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
        if (carParks.length > 0) {
          this.mapCenter = this.getPosition(carParks[0]);
        }
        this.updateMapMarkers();
      } catch (error) {
        alert('Failed to fetch car parks. Please try again later.');
      }
    },
    async selectCarPark(carParkOrMarker) {
      const carPark = carParkOrMarker.carPark || carParkOrMarker;
      this.selectedCarPark = carPark;
      try {
        const bays = await fetchCarParkBays(carPark.carpark_id);
        this.selectedCarPark.bays = bays;
        this.selectedCarPark.baysWithEVCharging = bays.filter(bay => bay.hasEVCharging).length;
        this.selectedCarPark.baysWithDisabledAccess = bays.filter(bay => bay.disabled).length;
        const maxVehicleSize = Math.max(...bays.map(bay => vehicleSizeMapping[bay.vehicleSize] || 0));
        this.selectedCarPark.largestVehicleSize = vehicleSizeName[maxVehicleSize] || 'Not Available';
        this.showModal = true;
      } catch (error) {
        console.error('Error fetching bays:', error);
      }
    },
    closeModal() {
      this.showModal = false;
    },
    bookCarPark() {
      this.$router.push({ name: 'BayBooking', params: { carparkId: this.selectedCarPark.carpark_id } });
    },
    getPosition(carPark) {
      return { lat: parseFloat(carPark.latitude), lng: parseFloat(carPark.longitude) };
    },
    updateMapMarkers() {
      this.mapMarkers = this.filteredCarParks.map(carPark => ({
        position: this.getPosition(carPark),
        carPark,
      }));
    },
  },
  mounted() {
    this.fetchCarParks();
  },
  watch: {
    filteredCarParks() {
      this.updateMapMarkers();
    },
  }
};
</script>

<style scoped>
.hover-highlight:hover {
  background-color: #f8f9fa;
}
</style>