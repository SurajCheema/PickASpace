<!-- EVConfirmationModal.vue -->
<template>
    <div v-if="show" class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Non-EV Vehicle</h5>
                </div>
                <div class="modal-body">
                    <p>{{ message }}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click="cancel">Cancel</button>
                    <button type="button" class="btn btn-danger" @click="confirm">Take Risk Anyway</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        show: Boolean,
        message: String
    },
    methods: {
        confirm() {
            this.$emit('confirm');
        },
        cancel() {
            this.$emit('cancel');
        }
    }
};
</script>

<style scoped>
.modal {
    display: block;
    background-color: rgba(0, 0, 0, 0.5);
}
</style>