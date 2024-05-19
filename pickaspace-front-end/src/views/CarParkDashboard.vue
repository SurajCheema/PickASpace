<template>
  <div class="container mt-5" style="max-width: 70%; margin: 0 auto;">
    <div class="input-group mb-3">
      <input type="text" class="form-control" placeholder="Search by address..." v-model="searchQuery" @input="fetchCarParks">
      <div class="input-group-append">
        <button class="btn btn-outline-secondary" type="button" @click="fetchCarParks">Search</button>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="card mb-3">
          <div class="card-body">
            <GoogleMap :center="mapCenter" :markers="mapMarkers" @marker-click="selectCarPark" />
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md-4" v-for="carPark in filteredCarParks" :key="carPark.carpark_id">
        <div class="card mb-3 hover-highlight blue-background" style="cursor:pointer" @click="selectCarPark(carPark)">
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
            <button type="button" class="close" @click="closeModal" aria-label="Close" style="position: absolute; right: 20px; top: 20px;">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p><strong>Address:</strong> {{ selectedCarPark.addressLine1 }}, {{ selectedCarPark.addressLine2 }}, {{ selectedCarPark.city }}, {{ selectedCarPark.postcode }}</p>
            <p><strong>Open Time:</strong> {{ formattedOpenTime }}</p>
            <p><strong>Close Time:</strong> {{ formattedCloseTime }}</p>
            <p><strong>Access Instructions:</strong> {{ selectedCarPark.accessInstructions }}</p>
            <p><strong>Total Number of Bays:</strong> {{ selectedCarPark.bays.length }}</p>
            <p><strong>Number of Bays with EV Charging:</strong> {{ selectedCarPark.baysWithEVCharging }}</p>
            <p><strong>Number of Bays with Disabled Access:</strong> {{ selectedCarPark.baysWithDisabledAccess || 'N/A' }}</p>
            <p><strong>Largest Vehicle Size:</strong> {{ selectedCarPark.largestVehicleSize }}</p>
            <!-- Pricing details for car park -->
            <div class="pricing-container">
              <h6 style="text-align:center;"><strong>Pricing:</strong></h6>
              <div class="grid grid-cols-2 gap-4">
                <div class="pricing-card">
                  <p><strong>Hourly:</strong> £{{ selectedCarPark.pricing.hourly.toFixed(2) }}</p>
                </div>
                <div class="pricing-card">
                  <p><strong>Daily:</strong> £{{ selectedCarPark.pricing.daily.toFixed(2) }}</p>
                </div>
                <div class="pricing-card">
                  <p><strong>Weekly:</strong> £{{ selectedCarPark.pricing.weekly.toFixed(2) }}</p>
                </div>
                <div class="pricing-card">
                  <p><strong>Monthly:</strong> £{{ selectedCarPark.pricing.monthly.toFixed(2) }}</p>
                </div>
              </div>
            </div>
            <button class="btn btn-primary" @click="bookCarPark" style="text-align:center;">Book Car Park</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global google */
import { fetchCarParks, fetchCarParkBays } from '@/services/carParkService';
import GoogleMap from '@/components/GoogleMap.vue';
import { Loader } from '@googlemaps/js-api-loader';

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
      geocoder: null,
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
    formattedOpenTime() {
      if (!this.selectedCarPark || !this.selectedCarPark.openTime) return '';
      return new Date(this.selectedCarPark.openTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    },
    formattedCloseTime() {
      if (!this.selectedCarPark || !this.selectedCarPark.closeTime) return '';
      return new Date(this.selectedCarPark.closeTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
  },
  methods: {
    async fetchCarParks() {
      const searchParams = new URLSearchParams({ query: this.searchQuery }).toString();
      try {
        const carParks = await fetchCarParks(searchParams);
        this.carParks = carParks;

        if (this.searchQuery) {
          await this.geocodeAddress(this.searchQuery);
        } else if (carParks.length > 0 && this.isValidPosition(this.getPosition(carParks[0]))) {
          this.mapCenter = this.getPosition(carParks[0]);
        }

        this.updateMapMarkers();
      } catch (error) {
        console.error('Failed to fetch car parks:', error);
      }
    },
    async geocodeAddress(address) {
      if (!this.geocoder) {
        const loader = new Loader({
          apiKey: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();
        this.geocoder = new google.maps.Geocoder();
      }

      return new Promise((resolve, reject) => {
        this.geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK') {
            const location = results[0].geometry.location;
            this.mapCenter = { lat: location.lat(), lng: location.lng() };
            resolve();
          } else if (status === 'ZERO_RESULTS') {
            console.warn('Geocoding returned no results');
            resolve(); // Resolve the promise even if no results are found
          } else {
            console.error('Geocoding failed:', status);
            reject(new Error('Geocoding failed'));
          }
        });
      });
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
      if (!carPark || isNaN(carPark.latitude) || isNaN(carPark.longitude)) {
        console.warn('Invalid car park data', carPark);
        return { lat: 51.5074, lng: -0.1278 }; // Default position
      }
      return { lat: parseFloat(carPark.latitude), lng: parseFloat(carPark.longitude) };
    },
    isValidPosition(position) {
      return position && typeof position.lat === 'number' && !isNaN(position.lat) &&
        typeof position.lng === 'number' && !isNaN(position.lng);
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
.card {
  background-color: white; /* Default background color */
  transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;
  cursor: pointer;
}

.hover-highlight {
  transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;
}

.hover-highlight:hover {
  background-color: deepskyblue; /* Blue background on hover */
  transform: scale(1.05); /* Scale effect on hover */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Shadow for 3D effect */
}

.modal-dialog {
  max-width: 600px; /* Adjusts the modal width */
  margin: 1.75rem auto;
}

.modal-content {
  position: relative; /* Needed for absolute positioning of the close button */
  border-radius: 8px; /* Rounded corners */
  overflow: hidden; /* Ensures the children do not overflow the rounded corners */
  box-shadow: 0 12px 24px rgba(0,0,0,0.15); /* Adds shadow for depth */
  border: none; /* Removes default border */
}

.modal-header {
  background-color: white;
  padding: 20px;
  border-bottom: 1px solid #dee2e6; /* Adds a subtle line to separate the header */
}

.modal-title {
  margin: 0;
  font-size: 1.5rem; /* Adjusts title size */
  color: #333; /* Color for the text */
}

.pricing-container {
  padding: 20px;
  background-color: #ffffff; /* Bright background for pricing section */
  border-radius: 8px; /* Rounded corners for the container */
  box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* Subtle shadow for depth */
  margin-top: 20px; /* Spacing from the previous content */
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns */
  gap: 20px; /* Spacing between grid items */
}

.pricing-card {
  background-color: #f8f9fa; /* Slightly different background for cards */
  padding: 15px;
  border-radius: 6px; /* Soft rounded corners for cards */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* Lighter shadow for each card */
  background: linear-gradient(to right, #ffffff, #b3d4fc);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.close {
  position: absolute;
  right: 20px;
  top: 20px;
  border: none;
  background: none;
  color: #aaa;
  font-size: 1.5rem;
  opacity: 0.8;
}

.close:hover {
  color: #f00;
  opacity: 1;
}

.modal-body {
  padding: 20px;
  text-align: justify;
  background: linear-gradient(to right, #ffffff, #b3d4fc);
}


</style>