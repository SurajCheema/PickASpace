<template>
  <b-modal v-model="localIsVisible" title="Request Refund" @hide="closeModal">
    <template v-slot:default>
      <form @submit.prevent="submitRefund">
        <div class="form-group">
          <label for="refundReason">Reason for Refund</label>
          <textarea id="refundReason" v-model="reason" class="form-control" rows="4"
            placeholder="Please provide a reason for the refund request..." required></textarea>
        </div>

        <div class="mt-3">
          <button type="submit" class="btn btn-danger">Submit Refund Request</button>
        </div>
      </form>
    </template>
  </b-modal>
</template>

<script>
import { BModal } from 'bootstrap-vue-next';

export default {
  components: {
    BModal,
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    paymentId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      reason: '',
      localIsVisible: this.isVisible,
    };
  },
  watch: {
    isVisible(newVal) {
      this.localIsVisible = newVal;
    }
  },
  methods: {
    closeModal() {
      this.localIsVisible = false;
      this.$emit('close');
    },
    submitRefund() {
      this.$emit('request-refund', this.paymentId.toString(), this.reason);
      this.closeModal();
    }
  },
};
</script>