<template>
    <div>
        <b-list-group flush>
            <b-list-group-item v-for="booking in bookings" :key="booking.log_id" button class="mb-3 booking-item"
                @click="$emit('booking-selected', booking)">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="booking-info d-flex flex-column align-items-start">
                        <h5 class="mb-1">
                            Booking ID: {{ booking.log_id }}
                            <span v-if="booking.status.toLowerCase() === 'cancelled'"
                                class="text-danger">(Cancelled)</span>
                        </h5>
                        <p class="mb-1">{{ booking.carPark?.addressLine1 }}</p>
                        <p>{{ booking.carPark?.city }}</p>
                        <p>{{ formatDateTime(booking.startTime) }} - {{ formatDateTime(booking.endTime) }}</p>
                    </div>
                    <button v-if="canCancel(booking)" @click.stop="confirmCancel(booking)"
                        class="btn btn-danger cancel-btn">
                        Cancel Booking
                    </button>
                </div>
            </b-list-group-item>
        </b-list-group>
    </div>
</template>

<script>
import { BListGroup, BListGroupItem } from 'bootstrap-vue-next';
import { cancelBooking as cancelBookingService } from '@/services/carParkService';

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
            return ['reserved', 'active'].includes(booking.status) && endTime > now;
        },
        confirmCancel(booking) {
            if (confirm('Are you sure you want to cancel this booking?')) {
                this.cancelBooking(booking);
            }
        },
        async cancelBooking(booking) {
            try {
                const cancelledBooking = await cancelBookingService(booking.log_id);
                this.$emit('booking-cancelled', cancelledBooking);  // Emit an event with the cancelled booking data
                alert('Booking cancelled successfully.');
                location.reload();  // Reload the page to reflect changes
            } catch (error) {
                console.error('Error cancelling booking:', error);
                alert('Error cancelling booking: ' + error.message);
            }
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
    flex-grow: 1;
    padding-bottom: 0;
}

.booking-info h5,
.booking-info p {
    margin-bottom: 0.25rem;
}

.booking-info p:last-of-type {
    margin-bottom: 0;
}

.cancel-btn {
    white-space: nowrap;
    margin-left: 1rem;
}

.text-danger {
    color: #dc3545 !important;
}
</style>