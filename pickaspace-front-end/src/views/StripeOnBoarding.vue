<template>
    <div>
        <button @click="handleOnboarding">Complete Stripe Onboarding</button>
        <p v-if="error">{{ error }}</p>
    </div>
</template>

<script>
import { createStripeOnboardingLink } from '../services/paymentService';

export default {
    name: 'StripeOnBoarding',
    data() {
        return {
            error: null,
        };
    },
    methods: {
        async handleOnboarding() {
  try {
    const { url } = await createStripeOnboardingLink();
    console.log('Redirecting to Stripe with URL:', url);
    setTimeout(() => {
      window.location.href = url;
    }, 500); // Delay the redirection by 500ms
  } catch (error) {
    console.error('Failed to get onboarding link:', error);
    this.error = 'Could not start onboarding process. Please try again.';
  }
}

    }
}
</script>