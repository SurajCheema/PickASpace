<template>
    <b-modal v-model="modalShow" title="Booking Details" @hide="hideModal" ok-only>
        <div v-if="booking">
            <p><strong>Booking ID:</strong> {{ booking.log_id }}</p>
            <p><strong>Car Park ID:</strong> {{ booking.carpark_id }}</p>
            <p><strong>Full Address:</strong> {{ booking.carPark.addressLine1 }}, {{ booking.carPark.addressLine2 }},
                {{ booking.carPark.city }}, {{ booking.carPark.postcode }}</p>
            <p><strong>Bay Number:</strong> {{ booking.bay.bay_number }}</p>
            <p><strong>Cost:</strong> £{{ booking.cost.toFixed(2) }}</p>
            <p><strong>Start Time:</strong> {{ formatDateTime(booking.startTime) }}</p>
            <p><strong>End Time:</strong> {{ formatDateTime(booking.endTime) }}</p>
            <p><strong>Status:</strong> {{ booking.status }}</p>
            <p><strong>Vehicle Size:</strong> {{ booking.bay.vehicleSize }}</p>
            <p><strong>EV Charging:</strong> {{ booking.bay.hasEVCharging ? 'Yes' : 'No' }}</p>
            <p><strong>Disabled Access:</strong> {{ booking.bay.disabled ? 'Yes' : 'No' }}</p>
            <p><strong>Description:</strong> {{ booking.bay.description }}</p>
            <button v-if="showViewPaymentButton" @click="viewPayment" class="btn btn-primary mt-3">
                View Payment
            </button>
            <button v-if="shouldShowCancelButton(booking)" @click="confirmCancel" class="btn btn-danger mt-3">
                Cancel Booking
            </button>
        </div>
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
                return !!this.booking;
            },
            set(value) {
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
        formatDateTime(datetime) {
            const date = new Date(datetime);
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} 
            ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        },
        shouldShowCancelButton(booking) {
            const now = new Date();
            return ['reserved', 'active'].includes(booking.status) && new Date(booking.endTime) > now;
        },
        confirmCancel() {
            if (confirm('Are you sure you want to cancel this booking?')) {
                this.cancelBooking();
            }
        },
        async cancelBooking() {
            try {
                console.log(`Attempting to cancel booking with ID: ${this.booking.log_id}`);
                const data = await cancelBookingService(this.booking.log_id);

                console.log('Cancellation response:', data);
                const cancelledBooking = { ...this.booking, ...data.booking };
                console.log('Updated booking after cancellation:', cancelledBooking);
                this.$emit('booking-cancelled', cancelledBooking);
                this.modalShow = false; // Hide modal after cancellation
            } catch (error) {
                console.error('Error cancelling booking:', error);
                alert('Error cancelling booking: ' + error.message);
            }
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