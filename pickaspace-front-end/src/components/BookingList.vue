<template>
    <div>
        <b-list-group flush>
            <b-list-group-item v-for="booking in bookings" :key="booking.log_id" button class="mb-3 booking-item"
                @click="$emit('booking-selected', booking)">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="booking-info d-flex flex-column align-items-start">
                        <h5 class="mb-1">
                            Booking ID: {{ booking.log_id }}
                            <span v-if="booking.status === 'Cancelled'" class="text-danger">(Cancelled)</span>
                        </h5>
                        <p class="mb-1">{{ booking.carPark?.addressLine1 }}</p>
                        <p>{{ booking.carPark?.city }}</p>
                        <p>{{ formatDateTime(booking.startTime) }} - {{ formatDateTime(booking.endTime) }}</p>
                    </div>
                    <button v-if="canCancel(booking)" @click.stop="cancelBooking(booking)" class="btn btn-danger cancel-btn">
                        Cancel Booking
                    </button>
                </div>
            </b-list-group-item>
        </b-list-group>
    </div>
</template>

<script>
import { BListGroup, BListGroupItem } from 'bootstrap-vue-next';

export default {
    components: {
        BListGroup,
        BListGroupItem
    },
    props: ['bookings'],
    methods: {
        formatDateTime(datetime) {
            const date = new Date(datetime);
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} 
            ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        },

        canCancel(booking) {
            const now = new Date();
            const endTime = new Date(booking.endTime);
            // Allow cancellation if booking is either 'reserved' or 'active'
            return ['reserved', 'active'].includes(booking.status)
                && endTime > now; // Current time is before end time
        },
        cancelBooking(booking) {
            this.$emit('cancel-booking', booking.log_id);
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

.booking-info {
    flex-grow: 1; /* Allows details to take up as much space as possible */
    padding-bottom: 0; /* Removes padding at the bottom */
}

.booking-info h5,
.booking-info p {
    margin-bottom: 0.25rem; /* Reduces spacing between lines */
}

.booking-info p:last-of-type {
    margin-bottom: 0; /* Removes bottom margin from the last paragraph */
}

.cancel-btn {
    white-space: nowrap; /* Prevents the button from wrapping onto the next line */
    margin-left: 1rem; /* Adds some spacing between the details and the button */
}

.text-danger {
    color: #dc3545 !important; /* Ensures cancelled text is red */
}
</style>