<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <h2 class="text-center mb-4">Complete Your Stripe Onboarding</h2>
        <p class="text-center mb-4">
          Click the button below to start onboarding. Please follow the detailed steps to add your parking lot to PickASpace.
        </p>
        <div class="text-center mb-4">
          <button @click="handleOnboarding" class="btn btn-primary btn-lg">
            Start Onboarding
          </button>
        </div>
        <p class="text-center mb-4">
          <strong>Exciting news!</strong> By clicking the "Start Onboarding" button above, you'll be taken to the Stripe onboarding page in a new window. 🎉 PickASpace is thrilled to help you start earning money with your car park spaces! 💰 We can't wait to see you succeed! 😊
        </p>
        <div v-if="error" class="alert alert-danger text-center">{{ error }}</div>
        <div id="carouselExampleControls" class="carousel slide">
          <div class="carousel-inner">
            <div v-for="(step, index) in steps" :key="index" :class="['carousel-item', { active: index === 0 }]">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Step {{ index + 1 }}</h5>
                  <p class="card-text">{{ step }}</p>
                </div>
              </div>
            </div>
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>
        <p class="text-center mt-4">
          <strong>Hey there, future parking pro! 🚗</strong> Simply use the arrows on the carousel to navigate through each step of the Stripe onboarding process. 👆 It's super easy and will guide you on your journey to earning money with PickASpace! 🌟 We've made it as user-friendly as possible, so you'll be up and running in no time! 😄 Let's get started and make your parking dreams a reality! 🎊
        </p>
      </div>
    </div>
  </div>
</template>
<script>
import { createStripeOnboardingLink } from '../services/paymentService';
import { Carousel } from 'bootstrap';

export default {
  name: 'StripeOnBoarding',
  data() {
    return {
      error: null,
      steps: [
        "Mobile Number Entry: Do not enter your email. Click on 'the test phone number' text to use a preset mobile number for verification.",
        "Mobile Authentication: Choose 'Use test code' for mobile authentication.",
        "Select Type of Business: Select 'Individual/Sole Trader' from the options available.",
        "Personal Information: Enter first name and last name. Use the same email as registered on PickASpace. For the address, enter 'University Road, Leicester, LE1 7RA' for testing purposes. Enter all zeros ('0000000') for the phone number.",
        "Industry Selection: From the dropdown list, select 'Parking lots' as the industry.",
        "Website Description: If asked for a website, click to choose 'product description' and describe your car park.",
        "Bank Account Details: Click the 'Use test account' button to automatically fill in the form with a test bank account.",
        "Final Review: Review the form for any highlighted errors or required fields in red text.",
        "Submit the Onboarding Form: Ensure all information is correct, then click 'Agree and submit' to complete the process."
      ],
      carousel: null
    };
  },
  mounted() {
    this.carousel = new Carousel(document.getElementById('carouselExampleControls'), {
      interval: false,
      wrap: false
    });
  },
  beforeUnmount() {
    this.carousel.dispose();
  },
  methods: {
    async handleOnboarding() {
      try {
        const { url } = await createStripeOnboardingLink();
        console.log('Redirecting to Stripe with URL:', url);
        window.open(url, '_blank');
      } catch (error) {
        console.error('Failed to get onboarding link:', error);
        this.error = 'Could not start onboarding process. Please try again.';
      }
    }
  }
}
</script>
<style scoped>
.carousel-control-prev,
.carousel-control-next {
  width: 5%;
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  filter: invert(1);
  background-color: black;
  border-radius: 50%;
  padding: 10px;
}

.card-body {
  padding: 1.25rem 2.5rem;
}
</style>