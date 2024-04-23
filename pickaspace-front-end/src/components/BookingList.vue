<template>
    <div>
        <b-list-group flush>
            <b-list-group-item v-for="booking in bookings" :key="booking.log_id" button class="mb-3 booking-item"
                @click="showDetails(booking)">
                <div class="d-flex flex-column align-items-start">
                    <h5 class="mb-1">Booking ID: {{ booking.log_id }}</h5>
                    <p class="mb-1">{{ booking.carPark?.addressLine1 }}</p>
                    <p>{{ booking.carPark?.city }}</p>
                </div>
            </b-list-group-item>
        </b-list-group>

        <b-modal v-model="modalShow" title="Booking Details" @hide="hideModal">
            <template #modal-title>
                <strong>Booking Details (ID: {{ selectedBooking.log_id || 'N/A' }})</strong>
            </template>
            <div>
                <p>Car Park ID: {{ selectedBooking.carpark_id || 'N/A' }}</p>
                <p>Full Address: {{ selectedBooking.carPark?.addressLine1 }}, {{
                selectedBooking.carPark?.addressLine2 }},
                    {{ selectedBooking.carPark?.city }}, {{ selectedBooking.carPark?.postcode }}</p>
                <p>Bay Number: {{ selectedBooking.bay?.bay_number || 'N/A' }}</p>
                <p>Cost: £{{ (selectedBooking.cost && selectedBooking.cost.toFixed(2)) || '0.00' }}</p>
                <p>Start Time: {{ selectedBooking.startTime ? new Date(selectedBooking.startTime).toLocaleString() :
                'N/A' }}</p>
                <p>End Time: {{ selectedBooking.endTime ? new Date(selectedBooking.endTime).toLocaleString() : 'N/A' }}
                </p>
                <p>Status: {{ selectedBooking.status || 'Unknown' }}</p>
                <p>Vehicle Size: {{ selectedBooking.bay?.vehicleSize || 'N/A' }}</p>
                <p>EV Charging: {{ selectedBooking.bay?.hasEVCharging ? 'Yes' : 'No' }}</p>
                <p>Disabled Access: {{ selectedBooking.bay?.disabled ? 'Yes' : 'No' }}</p>
                <p>Description: {{ selectedBooking.bay?.description || 'No description available' }}</p>
                <button @click="modalShow = false" class="btn btn-primary">Close</button>
            </div>
        </b-modal>
    </div>
</template>

<script>
export default {
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
        }
    }
}
</script>

<style scoped>
.mb-3 {
    margin-bottom: 1rem !important;
    /* Adds space between booking items */
}

.booking-item {
    cursor: pointer;
    border: 1px solid #dee2e6;
    /* Adds a border around each booking item */
}
</style>