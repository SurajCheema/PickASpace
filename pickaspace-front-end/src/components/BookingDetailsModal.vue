<template>
    <b-modal v-model="modalShow" title="Booking Details" @hide="hideModal" ok-only>
        <div v-if="booking">
            <p>Booking ID: {{ booking.log_id || 'N/A' }}</p>
            <p>Car Park ID: {{ booking?.carpark_id || 'N/A' }}</p>
            <p>Full Address: {{ booking?.carPark?.addressLine1 }}, {{ booking?.carPark?.addressLine2 }}, {{
        booking?.carPark?.city }}, {{ booking?.carPark?.postcode }}</p>
            <p>Bay Number: {{ booking.bay?.bay_number || 'N/A' }}</p>
            <p>Cost: £{{ (booking.cost && booking.cost.toFixed(2)) || '0.00' }}</p>
            <p>Start Time: {{ formatDateTime(booking.startTime) }}</p>
            <p>End Time: {{ formatDateTime(booking.endTime) }}</p>
            <p>Status: {{ booking.status }}</p>
            <p>Vehicle Size: {{ booking.bay?.vehicleSize || 'N/A' }}</p>
            <p>EV Charging: {{ booking.bay?.hasEVCharging ? 'Yes' : 'No' }}</p>
            <p>Disabled Access: {{ booking.bay?.disabled ? 'Yes' : 'No' }}</p>
            <p>Description: {{ booking.bay?.description || 'No description available' }}</p>
            <button v-if="shouldShowCancelButton(booking)" @click="cancelBooking" class="btn btn-danger">
                Cancel Booking
            </button>
        </div>
        <template v-if="booking" #modal-footer>
            <button v-if="shouldShowCancelButton(booking)" class="btn btn-danger" @click="cancelBooking">
                Cancel Booking
            </button>
        </template>
    </b-modal>
</template>

<script>
import { BModal } from 'bootstrap-vue-next';
import { cancelBooking as cancelBookingService } from '@/services/carParkService';

export default {
    components: {
        BModal
    },
    props: ['booking', 'showViewBookingButton'],

    // In the BookingDetailsModal component
    watch: {
        booking(newVal) {
            console.log('Booking prop changed:', newVal);
        }
    },

    computed: {
        modalShow: {
            get() {
                console.log('Computed modalShow getter called, booking:', this.booking);
                return !!this.booking;
            },
            set(value) {
                console.log('Computed modalShow setter called, value:', value);
                if (!value) {
                    this.$emit('close');
                }
            }
        }
    },
    methods: {
        hideModal() {
            this.$emit('close');
        },
        async cancelBooking() {
            try {
                await cancelBookingService(this.booking.log_id);
                this.$emit('booking-cancelled', this.booking.log_id);
                this.modalShow = false;
            } catch (error) {
                alert(error.message);
            }
        },
        formatDateTime(datetime) {
            const date = new Date(datetime);
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} 
            ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        },
        shouldShowCancelButton(booking) {
            const now = new Date();
            return booking.status === 'reserved' && new Date(booking.endTime) > now;
        }
    }
};
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
    margin-bottom: 0;
}

.booking-item .date-time {
    margin-top: 0.5rem;
}

.booking-item p {
    margin-top: 0;
    margin-bottom: 0;
}
</style>