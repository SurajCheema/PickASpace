<template>
    <div class="manage-carparks">
        <h1>Manage Your Carparks</h1>
        <div v-for="carpark in carparks" :key="carpark.carpark_id" class="carpark-item">
            <div @click="showDetails(carpark)">
                <p><strong>ID:</strong> {{ carpark.carpark_id }}</p>
                <p><strong>Address:</strong> {{ carpark.addressLine1 }}, {{ carpark.city }}</p>
            </div>
            <button @click="editCarPark(carpark.carpark_id)">Edit</button>
            <button @click="deleteCarPark(carpark.carpark_id)">Delete</button>
        </div>

        <!-- CarParkDetailsModal Component -->
        <car-park-details-modal v-if="selectedCarPark" :carpark="selectedCarPark" @close="selectedCarPark = null"
            :hide-book-button="true"></car-park-details-modal>
    </div>
</template>

<script>
import CarParkDetailsModal from '@/components/CarParkDetailsModal.vue';
import { fetchCarParks, deleteCarPark as deleteCarParkAPI } from '@/services/carParkService';

export default {
    components: {
        CarParkDetailsModal
    },
    data() {
        return {
            carparks: [],
            selectedCarPark: null,
            searchQuery: '' // Ensure this is initialized properly
        };
    },
    created() {
        this.loadCarParks();
    },
    methods: {
        async loadCarParks() {
            const searchParams = new URLSearchParams({ query: this.searchQuery || '' }).toString(); // Handle undefined searchQuery
            try {
                this.carparks = await fetchCarParks(searchParams);
                this.carparks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } catch (error) {
                console.error('Failed to load carparks:', error);
            }
        },
        showDetails(carpark) {
            this.selectedCarPark = carpark;
        },
        editCarPark(carparkId) {
            this.$router.push({ name: 'EditCarPark', params: { carparkId } });
        },
        async deleteCarPark(carparkId) {
            try {
                await deleteCarParkAPI(carparkId);
                this.loadCarParks();  
                alert('Car park deleted successfully.');
            } catch (error) {
                alert('Failed to delete car park: ' + error.message);
            }
        }
    }
};
</script>


<style scoped>
.manage-carparks .carpark-item {
    margin: 10px;
    padding: 10px;
    background-color: #f3f3f3;
    cursor: pointer;
}

.manage-carparks button {
    margin-left: 10px;
}
</style>