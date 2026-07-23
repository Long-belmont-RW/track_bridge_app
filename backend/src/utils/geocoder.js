import axios from 'axios';

/**
 * Converts a text address into latitude and longitude using LocationIQ.
 * @param {string} address - The physical address to geocode.
 * @returns {Promise<{lat: number, lng: number}|null>} - The coordinates or null if it fails.
 */
export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://us1.locationiq.com/v1/search.php', {
      params: {
        key: process.env.LOCATIONIQ_API_KEY,
        q: address,
        format: 'json',
        limit: 1
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error(`Geocoding failed for address: ${address}`, error.message);
    return null;
  }
};