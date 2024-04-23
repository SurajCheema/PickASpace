<template>
    <div>
        <b-list-group flush>
            <b-list-group-item v-for="booking in bookings" :key="booking.log_id" button class="mb-3 booking-item"
                @click="showDetails(booking)">
                <div class="d-flex flex-column align-items-start">
                    <h5 class="mb-1">
                        Booking ID: {{ booking.log_id }}
                        <span v-if="booking.status === 'Cancelled'" class="text-danger">(Cancelled)</span>
                    </h5>
                    <p class="mb-1">{{ booking.carPark?.addressLine1 }}</p>
                    <p>{{ booking.carPark?.city }}</p>
                    <p>{{ formatDateTime(booking.startTime) }} - {{ formatDateTime(booking.endTime) }}</p>
                </div>
            </b-list-group-item>
        </b-list-group>

        <b-modal v-model="modalShow" title="Booking Details" @hide="hideModal">
            <template #modal-title>
                <strong>Booking Details (ID: {{ selectedBooking.log_id || 'N/A' }})</strong>
            </template>
            <div>
                <p>Car Park ID: {{ selectedBooking.carpark_id || 'N/A' }}</p>
                <p>Full Address: {{ selectedBooking.carPark?.addressLine1 }}, {{ selectedBooking.carPark?.addressLine2
                    }},
                    {{ selectedBooking.carPark?.city }}, {{ selectedBooking.carPark?.postcode }}</p>
                <p>Bay Number: {{ selectedBooking.bay?.bay_number || 'N/A' }}</p>
                <p>Cost: £{{ (selectedBooking.cost && selectedBooking.cost.toFixed(2)) || '0.00' }}</p>
                <p>Start Time: {{ selectedBooking.startTime ? formatDateTime(selectedBooking.startTime) : 'N/A' }}</p>
                <p>End Time: {{ selectedBooking.endTime ? formatDateTime(selectedBooking.endTime) : 'N/A' }}</p>
                <p>Status: {{ selectedBooking.status || 'Unknown' }}</p>
                <p>Vehicle Size: {{ selectedBooking.bay?.vehicleSize || 'N/A' }}</p>
                <p>EV Charging: {{ selectedBooking.bay?.hasEVCharging ? 'Yes' : 'No' }}</p>
                <p>Disabled Access: {{ selectedBooking.bay?.disabled ? 'Yes' : 'No' }}</p>
                <p>Description: {{ selectedBooking.bay?.description || 'No description available' }}</p>
            </div>
        </b-modal>
    </div>
</template>

<script>
import { BListGroup, BListGroupItem, BModal } from 'bootstrap-vue-next';
import { cancelBooking } from '@/services/carParkService';

export default {
    components: {
        BListGroup,
        BListGroupItem,
        BModal
    },
    props: ['bookings'],
    data() {
        return {
            modalShow: false,
            selectedBooking: {}
        };
    },
    methods: {
        showDetails(booking) {
            this.selectedBooking = booking;
            this.modalShow = true;
        },
        hideModal() {
            this.modalShow = false;
        },
        async cancelBooking() {
            try {
                await cancelBooking(this.selectedBooking.log_id);
                this.selectedBooking.status = 'Cancelled';  // Update local state
                alert('Booking cancelled successfully');
            } catch (error) {
                alert(error.message); // Display errors from the service layer
            }
            this.modalShow = false;  // Close the modal
        },
        formatDateTime(datetime) {
            const date = new Date(datetime);
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
    }
}
</script>

<style scoped>
.mb-3 {
    margin-bottom: 1rem !important;
}

.booking-item {
    cursor: pointer;
    border: 1px solid #dee2e6;
}

.booking-item .city-info {
    margin-bottom: 0; /* Reduce or remove margin to decrease space */
}

.booking-item .date-time {
    margin-top: 0.5rem; /* Adjust top margin to fine-tune space */
}

/* Apply margin rules specifically within booking-item */
.booking-item p {
    margin-top: 0;
    margin-bottom: 0;
}
</style>