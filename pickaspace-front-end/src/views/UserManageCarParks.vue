<template>
    <div class="manage-carparks">
      <h1>Manage Your Carparks</h1>
      <div class="carpark-list">
        <ul class="list-group">
          <li v-for="carpark in carparks" :key="carpark.carpark_id" class="list-group-item">
            <div @click="showDetails(carpark)">
              <p><strong>ID:</strong> {{ carpark.carpark_id }}</p>
              <p><strong>Address:</strong> {{ carpark.addressLine1 }}, {{ carpark.city }}</p>
            </div>
            <button class="btn btn-primary" @click="openEditModal(carpark)">Edit</button>
            <button class="btn btn-danger" @click="deleteCarPark(carpark.carpark_id)">Delete</button>
          </li>
        </ul>
      </div>
  
      <!-- CarParkDetailsModal Component -->
      <car-park-details-modal v-if="selectedCarPark" :carPark="selectedCarPark" @close="selectedCarPark = null"
          :hide-book-button="true" :is-visible="!!selectedCarPark"></car-park-details-modal>
    </div>
  </template>
  
  <script>
  import { reactive, toRefs } from 'vue';
  import { useRouter } from 'vue-router';
  import CarParkDetailsModal from '@/components/CarParkDetailsModal.vue';
  import { fetchCarParks, deleteCarPark as deleteCarParkAPI, fetchCarParkBays } from '@/services/carParkService';
  
  export default {
    components: {
      CarParkDetailsModal
    },
    setup() {
      const router = useRouter();
      const state = reactive({
        carparks: [],
        selectedCarPark: null,
        searchQuery: ''
      });
  
      async function loadCarParks() {
        const searchParams = new URLSearchParams({ query: state.searchQuery || '' }).toString();
        try {
          state.carparks = await fetchCarParks(searchParams);
          state.carparks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
          console.error('Failed to load carparks:', error);
        }
      }
  
      async function showDetails(carpark) {
        console.log(`Showing details for car park ID: ${carpark.carpark_id}`);
        if (!carpark.bays) {
          try {
            const bays = await fetchCarParkBays(carpark.carpark_id);
            console.log(`Fetched ${bays.length} bays for car park ID: ${carpark.carpark_id}`);
            carpark.bays = bays;
          } catch (error) {
            console.error('Failed to fetch bays:', error);
          }
        }
        state.selectedCarPark = carpark;
      }
  
      function openEditModal(carpark) {
        router.push({ name: 'EditCarPark', params: { carparkId: carpark.carpark_id } });
      }
  
      async function deleteCarPark(carparkId) {
        try {
          await deleteCarParkAPI(carparkId);
          await loadCarParks();
          alert('Car park deleted successfully.');
        } catch (error) {
          alert('Failed to delete car park: ' + error.message);
        }
      }
  
      loadCarParks();
  
      return {
        ...toRefs(state),
        showDetails,
        openEditModal,
        deleteCarPark
      };
    }
  };
  </script>
  
  <style scoped>
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
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
  }
  
  .list-group-item button {
    margin-left: 10px;
  }
  </style>
  