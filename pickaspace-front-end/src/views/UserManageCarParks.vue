<template>
  <div class="manage-carparks">
    <h1>Manage Your Carparks</h1>
    <div class="carpark-list">
      <ul class="list-group">
        <li v-for="carpark in carparks" :key="carpark.carpark_id" class="list-group-item">
          <div @click="showDetails(carpark)">
            <p><strong>ID:</strong> {{ carpark.carpark_id }}</p>
            <p><strong>Address:</strong> {{ carpark.addressLine1 }}, {{ carpark.city }}</p>
            <p v-if="carpark.deletedAt" class="text-danger">Deletes in {{ getRemainingDays(carpark.deletedAt) }} days
            </p>
          </div>
          <button class="btn btn-primary" @click="openEditModal(carpark)">Edit</button>
          <button class="btn btn-danger" @click="softDeleteCarPark(carpark.carpark_id)">Delete</button>
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
import { fetchCarParks, softDeleteCarPark as deleteCarParkAPI, fetchCarParkBays } from '@/services/carParkService'; 

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
      state.carparks = await fetchCarParks(searchParams);
      state.carparks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    async function showDetails(carpark) {
      console.log(`Showing details for car park ID: ${carpark.carpark_id}`);
      if (!carpark.bays) {
        const bays = await fetchCarParkBays(carpark.carpark_id);
        console.log(`Fetched ${bays.length} bays for car park ID: ${carpark.carpark_id}`);
        carpark.bays = bays;
      }
      state.selectedCarPark = carpark;
    }

    function openEditModal(carpark) {
      router.push({ name: 'EditCarPark', params: { carparkId: carpark.carpark_id } });
    }

    async function softDeleteCarPark(carparkId) {
      try {
        await deleteCarParkAPI(carparkId);  
        await loadCarParks();
        alert('Car park marked for deletion successfully.');
      } catch (error) {
        alert('Failed to mark car park for deletion: ' + error.message);
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
      softDeleteCarPark,
      getRemainingDays
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