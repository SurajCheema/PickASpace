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

    <CarParkDetailsModal :carPark="selectedCarPark" :isVisible="showModal" @close="closeModal" />
  </div>
</template>

<script>
import { reactive, toRefs, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchAllCarParks, adminSoftDeleteCarPark, forceDeleteCarPark as forceDeleteCarParkService, fetchCarParkBays } from '@/services/carParkService';
import CarParkDetailsModal from '@/components/CarParkDetailsModal.vue';

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
  components: {
    CarParkDetailsModal
  },
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

    function formatTime(time) {
      if (!time) return '';
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    loadCarParks();

    return {
      ...toRefs(state),
      showDetails,
      openEditModal,
      closeModal,
      localSoftDeleteCarPark,
      localForceDeleteCarPark,
      getRemainingDays,
      formatTime,
      formattedOpenTime: computed(() => formatTime(state.selectedCarPark?.openTime)),
      formattedCloseTime: computed(() => formatTime(state.selectedCarPark?.closeTime)),
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
