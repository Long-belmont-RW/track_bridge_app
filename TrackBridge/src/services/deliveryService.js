import api from './api';

export const uploadBulkDeliveries = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post('/deliveries/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading bulk deliveries:', error);
    throw error;
  }
};

export const generateRoutes = async () => {
  try {
    const response = await api.get('/routes/generate');
    return response.data;
  } catch (error) {
    console.error('Error generating routes:', error);
    throw error;
  }
};
export const getCompanyRoutes = async () => {
  try {
    const response = await api.get('/routes/generate');
    return response.data;
  } catch (error) {
    console.error('Error fetching company routes:', error);
    throw error;
  }
};

export const getPublicTracking = async (trackingNumber) => {
  try {
    const response = await api.get(`/deliveries/track/${trackingNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public tracking data:', error);
    throw error;
  }
};
