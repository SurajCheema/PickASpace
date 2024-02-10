// Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Create new car park
export const createCarPark = async (carParkData) => {
  // Complete endpoint URL
  const url = `${API_BASE_URL}/create-carpark`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(carParkData),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating car park:', error);
    throw error;
  }
};
