<template>
    <div v-if="isVisible" class="modal" tabindex="-1" role="dialog" style="display: block;">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Car Park Details</h5>
                    <button type="button" class="close" @click="close" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p><strong>Address:</strong> {{ carPark.addressLine1 }}, {{ carPark.addressLine2 }}, {{ carPark.city
                        }}, {{ carPark.postcode }}</p>
                    <p><strong>Open Time:</strong> {{ carPark.openTime }}</p>
                    <p><strong>Close Time:</strong> {{ carPark.closeTime }}</p>
                    <p><strong>Access Instructions:</strong> {{ carPark.accessInstructions }}</p>
                    <p><strong>Total Number of Bays:</strong> {{ carPark.bays.length }}</p>
                    <p><strong>Number of Bays with EV Charging:</strong> {{ evChargingCount }}</p>
                    <p><strong>Number of Bays with Disabled Access:</strong> {{ disabledAccessCount }}</p>
                    <div v-if="carPark.pricing">
                        <h6><strong>Pricing:</strong></h6>
                        <ul>
                            <li v-if="carPark.pricing.hourly"><strong>Hourly:</strong> £{{
        carPark.pricing.hourly.toFixed(2) }}</li>
                            <li v-if="carPark.pricing.daily"><strong>Daily:</strong> £{{
        carPark.pricing.daily.toFixed(2) }}</li>
                            <li v-if="carPark.pricing.weekly"><strong>Weekly:</strong> £{{
                                carPark.pricing.weekly.toFixed(2) }}</li>
                            <li v-if="carPark.pricing.monthly"><strong>Monthly:</strong> £{{
                                carPark.pricing.monthly.toFixed(2) }}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        carPark: {
            type: Object,
            required: true
        },
        isVisible: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        evChargingCount() {
            return this.carPark.bays.filter(bay => bay.hasEVCharging).length;
        },
        disabledAccessCount() {
            return this.carPark.bays.filter(bay => bay.disabled).length;
        }
    },
    methods: {
        close() {
            this.$emit('close');
        }
    }
};
</script>

<style scoped>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-dialog {
    width: 100%;
    max-width: 600px;
}

.modal-content {
    background-color: white;
    padding: 20px;
}

.close {
    cursor: pointer;
}
</style>