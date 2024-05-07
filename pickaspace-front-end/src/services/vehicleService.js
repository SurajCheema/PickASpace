// vehicleService.js

const API_URL = 'http://localhost:3000'; // Update to your backend server URL

export const fetchVehicleDetails = async (registrationNumber) => {
    try {
      const response = await fetch(`${API_URL}/api/vehicle-proxy/${registrationNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors[0].detail || 'Failed to fetch vehicle details');
      }
  
      return response.json();
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      throw error;
    }
  };