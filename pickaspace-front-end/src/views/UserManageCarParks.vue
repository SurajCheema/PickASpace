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
                    <button class="btn btn-primary" @click="editCarPark(carpark.carpark_id)">Edit</button>
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
import CarParkDetailsModal from '@/components/CarParkDetailsModal.vue';
import { fetchCarParks, deleteCarPark as deleteCarParkAPI, fetchCarParkBays } from '@/services/carParkService';

export default {
    components: {
        CarParkDetailsModal
    },
    data() {
        return {
            carparks: [],
            selectedCarPark: null,
            searchQuery: ''
        };
    },
    created() {
        this.loadCarParks();
    },
    methods: {
        async loadCarParks() {
            const searchParams = new URLSearchParams({ query: this.searchQuery || '' }).toString();
            try {
                this.carparks = await fetchCarParks(searchParams);
                this.carparks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } catch (error) {
                console.error('Failed to load carparks:', error);
            }
        },
        async showDetails(carpark) {
            console.log(`Showing details for car park ID: ${carpark.carpark_id}`);
            if (!carpark.bays) {
                try {
                    const bays = await fetchCarParkBays(carpark.carpark_id);
                    console.log(`Fetched ${bays.length} bays for car park ID: ${carpark.carpark_id}`);
                    carpark.bays = bays; // Direct assignment replaces $set
                } catch (error) {
                    console.error('Failed to fetch bays:', error);
                }
            }
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