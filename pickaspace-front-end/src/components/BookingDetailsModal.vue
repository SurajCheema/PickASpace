<template>
    <b-modal v-model="modalShow" title="Booking Details" @hide="hideModal" ok-only>
        <div v-if="booking">
            <p><strong>Booking ID:</strong> {{ booking.log_id || 'N/A' }}</p>
            <p><strong>Car Park ID:</strong> {{ booking?.carpark_id || 'N/A' }}</p>
            <p><strong>Full Address:</strong> {{ booking?.carPark?.addressLine1 }}, {{ booking?.carPark?.addressLine2 }}, {{ booking?.carPark?.city }}, {{ booking?.carPark?.postcode }}</p>
            <p><strong>Bay Number:</strong> {{ booking.bay?.bay_number || 'N/A' }}</p>
            <p><strong>Cost:</strong> £{{ (booking.cost && booking.cost.toFixed(2)) || '0.00' }}</p>
            <p><strong>Start Time:</strong> {{ formatDateTime(booking.startTime) }}</p>
            <p><strong>End Time:</strong> {{ formatDateTime(booking.endTime) }}</p>
            <p><strong>Status:</strong> {{ booking.status }}</p>
            <p><strong>Vehicle Size:</strong> {{ booking.bay?.vehicleSize || 'N/A' }}</p>
            <p><strong>EV Charging:</strong> {{ booking.bay?.hasEVCharging ? 'Yes' : 'No' }}</p>
            <p><strong>Disabled Access:</strong> {{ booking.bay?.disabled ? 'Yes' : 'No' }}</p>
            <p><strong>Description:</strong> {{ booking.bay?.description || 'No description available' }}</p>
            <button v-if="showViewPaymentButton" @click="viewPayment" class="btn btn-primary mt-3">
                View Payment
            </button>
        </div>
            <template v-if="booking" #modal-footer>
    <div class="d-flex justify-content-between w-100">
        <button v-if="shouldShowCancelButton(booking)" class="btn btn-danger" @click="cancelBooking">
            Cancel Booking
        </button>
        <div></div> <!-- Empty div to push the button to the left -->
    </div>
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
    props: {
        booking: {
            type: Object,
            required: true
        },
        showViewPaymentButton: {
            type: Boolean,
            default: false
        }
    },
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
        },
        viewPayment() {
            this.$emit('view-payment', this.booking.payment_id);
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