<template>
    <div ref="mapContainer" style="width: 100%; height: 400px;"></div>
  </template>
  
  <script>
  import { Loader } from '@googlemaps/js-api-loader';
  
  export default {
    name: 'GoogleMap',
    props: {
      center: {
        type: Object,
        required: true,
        validator: value => value && !isNaN(value.lat) && !isNaN(value.lng)
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
        google: null,
        defaultCenter: { lat: 51.5074, lng: -0.1278 }, // Fallback center coordinates
      };
    },
    mounted() {
      const loader = new Loader({
        apiKey: process.env.VUE_APP_GOOGLE_MAPS_API_KEY, // Use environment variable
        version: 'weekly',
        libraries: ['places'],
      });
  
      loader.load().then((google) => {
        this.google = google;
        if (this.$refs.mapContainer) {
          this.initializeMap();
        } else {
          console.error("Map container is not ready");
        }
      }).catch(e => {
        console.error("Error loading Google Maps:", e);
      });
    },
    methods: {
      initializeMap() {
        this.map = new this.google.maps.Map(this.$refs.mapContainer, {
          center: this.validCenter(this.center) || this.defaultCenter,
          zoom: 12,
        });
  
        this.updateMarkers();
      },
      validCenter(center) {
        if (this.isValidPosition(center)) {
          return center;
        } else {
          console.warn('Invalid center provided, using default');
          return this.defaultCenter;
        }
      },
      isValidPosition(position) {
        return position && typeof position.lat === 'number' && !isNaN(position.lat) &&
               typeof position.lng === 'number' && !isNaN(position.lng);
      },
      updateMarkers() {
        this.mapMarkers.forEach(marker => marker.setMap(null));
        this.mapMarkers = [];
  
        this.markers.forEach(markerData => {
          if (this.isValidPosition(markerData.position)) {
            const mapMarker = new this.google.maps.Marker({
              map: this.map,
              position: markerData.position,
            });
  
            mapMarker.addListener('click', () => {
              this.$emit('marker-click', markerData);
            });
  
            this.mapMarkers.push(mapMarker);
          } else {
            console.error('Invalid marker position:', markerData);
          }
        });
      }
    },
    watch: {
      center(newCenter) {
        if (this.map && this.isValidPosition(newCenter)) {
          this.map.setCenter(newCenter);
        } else {
          console.warn('Attempted to set invalid center:', newCenter);
        }
      },
      markers: {
        deep: true,
        handler(newMarkers) {
          this.updateMarkers(newMarkers);
        },
      }
    }
  };
  </script>
  