<template>
  <div class="user-booking-logs">
    <div class="text-center mb-4">
      <button class="btn btn-primary mx-2" @click="setActive('current')">Current</button>
      <button class="btn btn-primary mx-2" @click="setActive('upcoming')">Upcoming</button>
      <button class="btn btn-primary mx-2" @click="setActive('past')">Past</button>
    </div>
    <div>
      <booking-list :bookings="activeBookings" />
    </div>
  </div>
</template>

<script>
import BookingList from '../components/BookingList.vue';
import { fetchUserBookings } from '@/services/carParkService'; 

export default {
  components: {
    BookingList
  },
  data() {
    return {
      currentBookings: [],
      upcomingBookings: [],
      pastBookings: [],
      activeBookings: [],
      activeType: 'current'
    }
  },
  created() {
    this.fetchBookings();
  },
  methods: {
    async fetchBookings() {
      try {
        const bookings = await fetchUserBookings(); 
        this.currentBookings = bookings.current;
        this.upcomingBookings = bookings.upcoming;
        this.pastBookings = bookings.past;
        this.updateActiveBookings();
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    },
    updateActiveBookings() {
      if (this.activeType === 'current') {
        this.activeBookings = this.currentBookings;
      } else if (this.activeType === 'upcoming') {
        this.activeBookings = this.upcomingBookings;
      } else if (this.activeType === 'past') {
        this.activeBookings = this.pastBookings;
      }
    },
    setActive(type) {
      this.activeType = type;
      this.updateActiveBookings();
    }
  }
}
</script>

<style>
.user-booking-logs {
  max-width: 800px;
  margin: auto;
}
</style>
