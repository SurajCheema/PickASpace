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
                    <p><strong>Address:</strong> {{ carPark.addressLine1 }}, {{ carPark.addressLine2 }}, {{ carPark.city }}, {{ carPark.postcode }}</p>
                    <p><strong>Open Time:</strong> {{ formattedOpenTime }}</p>
                    <p><strong>Close Time:</strong> {{ formattedCloseTime }}</p>
                    <p><strong>Access Instructions:</strong> {{ carPark.accessInstructions }}</p>
                    <p><strong>Total Number of Bays:</strong> {{ totalBays }}</p>
                    <p><strong>Number of Bays with EV Charging:</strong> {{ evChargingCount }}</p>
                    <p><strong>Number of Bays with Disabled Access:</strong> {{ disabledAccessCount }}</p>
                    <div v-if="carPark.pricing" class="pricing-container">
                        <h6 style="text-align:center;"><strong>Pricing:</strong></h6>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="pricing-card" v-for="(price, key) in carPark.pricing" :key="key">
                                <p><strong>{{ key.charAt(0).toUpperCase() + key.slice(1) }}:</strong> £{{ price.toFixed(2) }}</p>
                            </div>
                        </div>
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
    watch: {
        carPark: {
            handler(newVal) {
                console.log('Car park data updated:', newVal);
            },
            deep: true
        }
    },
    computed: {
        totalBays() {
            console.log(`Total bays computed as: ${this.carPark.bays ? this.carPark.bays.length : 0}`);
            return this.carPark.bays ? this.carPark.bays.length : 0;
        },
        evChargingCount() {
            return this.carPark.bays ? this.carPark.bays.filter(bay => bay.hasEVCharging).length : 0;
        },
        disabledAccessCount() {
            return this.carPark.bays ? this.carPark.bays.filter(bay => bay.disabled).length : 0;
        },
        formattedOpenTime() {
            return this.formatTime(this.carPark.openTime);
        },
        formattedCloseTime() {
            return this.formatTime(this.carPark.closeTime);
        }
    },
    methods: {
        close() {
            this.$emit('close');
        },
        formatTime(timeString) {
            if (!timeString) return '';
            const date = new Date(timeString);
            return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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
    align-items: center
}

modal-dialog {
    max-width: 600px; /* Adjusts the modal width */
    margin: 1.75rem auto;
}

.modal-content {
    position: relative; /* Needed for absolute positioning of the close button */
    border-radius: 8px; /* Rounded corners */
    overflow: hidden; /* Ensures the children do not overflow the rounded corners */
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15); /* Adds shadow for depth */
    border: none; /* Removes default border */
    background-color: white;
    padding: 20px;
}

.modal-header {
    background-color: white;
    padding: 20px;
    border-bottom: 1px solid #dee2e6; /* Adds a subtle line to separate the header */
}

.modal-title {
    margin: 0;
    font-size: 1.5rem; /* Adjusts title size */
    color: #333; /* Color for the text */
}

.pricing-container {
    padding: 20px;
    background-color: #ffffff; /* Bright background for pricing section */
    border-radius: 8px; /* Rounded corners for the container */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
    margin-top: 20px; /* Spacing from the previous content */
}

.grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* Two columns */
    gap: 20px; /* Spacing between grid items */
}

.pricing-card {
    background-color: #f8f9fa; /* Slightly different background for cards */
    padding: 15px;
    border-radius: 6px; /* Soft rounded corners for cards */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* Lighter shadow for each card */
    background: linear-gradient(to right, #ffffff, #b3d4fc);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.close {
    position: absolute;
    right: 20px;
    top: 20px;
    border: none;
    background: none;
    color: #aaa;
    font-size: 1.5rem;
    opacity: 0.8;
}

.close:hover {
    color: #f00;
    opacity: 1;
}

.modal-body {
    padding: 20px;
    text-align: justify;
    background: linear-gradient(to right, #ffffff, #b3d4fc);
}
</style>