<template>
  <div class="manage-carparks">
    <h1>Manage Car Parks (Admin)</h1>
    <div class="carpark-list">
      <ul class="list-group">
        <li v-for="carpark in carparks" :key="carpark.carpark_id" class="list-group-item">
          <div @click="showDetails(carpark)" class="carpark-details">
            <p><strong>ID:</strong> {{ carpark.carpark_id }}</p>
            <p><strong>Address:</strong> {{ carpark.addressLine1 }}, {{ carpark.city }}</p>
            <p v-if="carpark.deletedAt" class="text-danger">Deletes in {{ getRemainingDays(carpark.deletedAt) }} days</p>
          </div>
          <div class="button-group">
            <button class="btn btn-primary" @click="openEditModal(carpark)">Edit</button>
            <button class="btn btn-danger" @click="localSoftDeleteCarPark(carpark.carpark_id)">Delete</button>
            <button class="btn btn-danger" @click="localForceDeleteCarPark(carpark.carpark_id)">Force Delete</button>
          </div>
        </li>
      </ul>
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
            <div class="pricing-container">
              <h6><strong>Pricing:</strong></h6>
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { fetchAllCarParks, adminSoftDeleteCarPark, forceDeleteCarPark as forceDeleteCarParkService, fetchCarParkBays } from '@/services/carParkService';

const vehicleSizeMapping = {
  "Small": 1,
  "Medium": 2,
  "Large": 3,
  "Van & Minibus": 4
};

const vehicleSizeName = {
  1: "Small",
  2: "Medium",
  3: "Large",
  4: "Van & Minibus"
};

export default {
  name: 'AdminManageCarParks',
  setup() {
    const router = useRouter();
    const state = reactive({
      carparks: [],
      selectedCarPark: null,
      showModal: false,
      searchQuery: ''
    });

    async function loadCarParks() {
      const searchParams = new URLSearchParams({ query: state.searchQuery || '' }).toString();
      state.carparks = await fetchAllCarParks(searchParams);
      state.carparks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    function openEditModal(carpark) {
      router.push({ name: 'AdminEditCarPark', params: { carparkId: carpark.carpark_id } });
    }

    async function showDetails(carpark) {
      console.log(`Showing details for car park ID: ${carpark.carpark_id}`);
      if (!carpark.bays) {
        try {
          const bays = await fetchCarParkBays(carpark.carpark_id);
          console.log(`Fetched ${bays.length} bays for car park ID: ${carpark.carpark_id}`);
          carpark.bays = bays;
          carpark.baysWithEVCharging = bays.filter(bay => bay.hasEVCharging).length;
          carpark.baysWithDisabledAccess = bays.filter(bay => bay.disabled).length;
          const maxVehicleSize = Math.max(...bays.map(bay => vehicleSizeMapping[bay.vehicleSize] || 0));
          carpark.largestVehicleSize = vehicleSizeName[maxVehicleSize] || 'Not Available';
        } catch (error) {
          console.error('Failed to fetch bays:', error);
        }
      }
      state.selectedCarPark = carpark;
      state.showModal = true;
    }

    function closeModal() {
      state.showModal = false;
    }

    async function localSoftDeleteCarPark(carparkId) {
      try {
        await adminSoftDeleteCarPark(carparkId);
        await loadCarParks();
        alert('Car park marked for deletion successfully.');
      } catch (error) {
        alert('Failed to mark car park for deletion: ' + error.message);
      }
    }

    async function localForceDeleteCarPark(carparkId) {
      try {
        await forceDeleteCarParkService(carparkId);
        loadCarParks();
        alert('Car park deleted permanently successfully.');
      } catch (error) {
        alert('Failed to delete car park permanently: ' + error.message);
      }
    }

    function getRemainingDays(deletedAt) {
      const deletionDate = new Date(deletedAt);
      const currentDate = new Date();
      const thirtyDaysLater = new Date(deletionDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const timeDiff = thirtyDaysLater.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff > 0 ? daysDiff : 0;
    }

    loadCarParks();

    return {
      ...toRefs(state),
      showDetails,
      openEditModal,
      closeModal,
      localSoftDeleteCarPark,
      localForceDeleteCarPark,
      getRemainingDays
    };
  }
};
</script>

<style scoped>
.manage-carparks {
  display: block; /* Ensures the div behaves as a block-level element */
  width: 60%; /* Full width for small screens */
  padding: 20px;
  margin: auto; /* Centers the div horizontally */
  margin-top: 2vw;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  background: #f0f0f0;
}

.carpark-list {
  display: flex;
  justify-content: center;
}

.list-group {
  max-width: 600px;
  width: 100%;
}

.list-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.carpark-details {
  flex: 1;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.button-group button {
  width: 120px; /* Adjust the width as needed */
}

/* Modal styles */
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
  background: linear-gradient(to right, #ffffff, #b3d4fc);
}
</style>
