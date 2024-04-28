<template>
    <div>
        <b-list-group flush>
            <b-list-group-item v-for="booking in bookings" :key="booking.log_id" button class="mb-3 booking-item"
                @click="$emit('booking-selected', booking)">
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
    margin-bottom: 0;
    /* Reduce or remove margin to decrease space */
}

.booking-item .date-time {
    margin-top: 0.5rem;
    /* Adjust top margin to fine-tune space */
}

/* Apply margin rules specifically within booking-item */
.booking-item p {
    margin-top: 0;
    margin-bottom: 0;
}
</style>