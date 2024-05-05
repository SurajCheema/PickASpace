<!-- src/components/GoogleMap.vue -->
<template>
    <div ref="mapContainer" style="width: 100%; height: 400px;"></div>
  </template>
  
  <script>
  /* global google */
  import { Loader } from '@googlemaps/js-api-loader';
  
  export default {
    name: 'GoogleMap',
    props: {
      center: {
        type: Object,
        required: true,
      },
      markers: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        map: null,
        mapMarkers: [],
      };
    },
    mounted() {
      const loader = new Loader({
        apiKey: 'AIzaSyCjx29srfv0Oq5TT56126YvJeRFh3oRVxQ',
        version: 'weekly',
        libraries: ['places'],
      });
  
      loader.load().then(() => {
        this.map = new google.maps.Map(this.$refs.mapContainer, {
          center: this.center,
          zoom: 12,
        });
  
        this.updateMarkers();
      });
    },
    watch: {
      markers(newMarkers) {
        this.updateMarkers(newMarkers);
      },
    },
    methods: {
      updateMarkers(markers = this.markers) {
        this.mapMarkers.forEach((marker) => marker.setMap(null));
        this.mapMarkers = [];
  
        markers.forEach((marker) => {
          const mapMarker = new google.maps.Marker({
            map: this.map,
            position: marker.position,
          });
  
          mapMarker.addListener('click', () => {
            this.$emit('marker-click', marker);
          });
  
          this.mapMarkers.push(mapMarker);
        });
      },
    },
  };
  </script>