<template>
    <div class="manage-carparks">
        <h1>Manage Car Parks (Admin)</h1>
        <div class="carpark-list">
            <ul class="list-group">
                <li v-for="carpark in carparks" :key="carpark.carpark_id" class="list-group-item">
                    <div @click="showDetails(carpark)">
                        <p><strong>ID:</strong> {{ carpark.carpark_id }}</p>
                        <p><strong>Address:</strong> {{ carpark.addressLine1 }}, {{ carpark.city }}</p>
                        <p v-if="carpark.deletedAt" class="text-danger">Deletes in {{ getRemainingDays(carpark.deletedAt) }} days</p>
                    </div>
                    <button class="btn btn-primary" @click="openEditModal(carpark)">Edit</button>
                    <button class="btn btn-danger" @click="localSoftDeleteCarPark(carpark.carpark_id)">Delete</button>
                    <button class="btn btn-danger" @click="localForceDeleteCarPark(carpark.carpark_id)">Force Delete</button>
                </li>
            </ul>
        </div>

        <!-- CarParkDetailsModal Component -->
        <car-park-details-modal 
            v-if="selectedCarPark" 
            :carPark="selectedCarPark" 
            @close="selectedCarPark = null"
            :hide-book-button="true" 
            :is-visible="!!selectedCarPark">
        </car-park-details-modal>
    </div>
</template>

<script>
import { reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import CarParkDetailsModal from '@/components/CarParkDetailsModal.vue';
import { fetchAllCarParks, adminSoftDeleteCarPark, forceDeleteCarPark as forceDeleteCarParkService, fetchCarParkBays } from '@/services/carParkService';

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
                state.carparks = await fetchAllCarParks(searchParams);
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
            localSoftDeleteCarPark,
            localForceDeleteCarPark,
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
