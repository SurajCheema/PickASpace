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

// Request refund for specific payment
export const requestRefund = async (paymentId, reason) => {
    const token = localStorage.getItem('token');
    try {
        const body = JSON.stringify({
            paymentId,
            reason,
        });

        const response = await fetch(`${API_BASE_URL}/request-refund`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: body
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to request refund');
        }

        return await response.json();
    } catch (error) {
        console.error('Error requesting refund:', error);
        throw error;
    }
};

// Fetch refunds from backend
export const fetchRefunds = async (filters) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/refunds`, { params: filters });
        return response.data;
    } catch (error) {
        console.error('Error fetching refunds:', error);
        throw new Error(error.response.data.message || 'Could not fetch refunds');
    }
};

// Update refund status
export const updateRefund = async (refundId, decision, status) => {
    try {
        const body = { decision, status };
        const response = await axios.put(`${API_BASE_URL}/refunds/${refundId}`, body);
        return response.data;
    } catch (error) {
        console.error('Error updating refund:', error);
        throw new Error(error.response.data.message || 'Could not update refund');
    }
};