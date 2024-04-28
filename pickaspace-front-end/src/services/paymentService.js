const API_BASE_URL = 'http://localhost:3000/api';

// Fetch payments from backend
export const fetchPayments = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/user/payments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch payments');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
    }
};

// Fetch payment by specific ID
export const fetchPaymentById = async (paymentId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch payment');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  };

// Refund payments
export const refundPayment = async (paymentId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/refund-payment/${paymentId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to process refund');
        }
        return await response.json();
    } catch (error) {
        console.error('Error processing refund:', error);
        throw error;
    }
};
