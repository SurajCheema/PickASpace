// vehicleService.js

const API_URL = 'http://localhost:3000'; 

export const fetchVehicleDetails = async (registrationNumber) => {
    if (!registrationNumber.trim()) {
      throw new Error("Please enter a car registration number.");
    }
  
    try {
      const response = await fetch(`${API_URL}/api/vehicle-proxy/${registrationNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors[0].detail || 'Invalid car registration number.');
      }
  
      return response.json();
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      throw error;
    }
  };  