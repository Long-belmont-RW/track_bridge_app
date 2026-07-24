import api from './api';

/**
 * Log in the user by posting email and password to the backend.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} user data
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  
  // Assuming the backend returns { token: '...', user: { ... } }
  const { token, user } = response.data;
  
  if (token) {
    localStorage.setItem('trackbridge_token', token);
  }
  
  return user;
};

/**
 * Log out the user by clearing localStorage.
 */
export const logout = () => {
  localStorage.removeItem('trackbridge_token');
  // Optionally remove other user data if stored
  // localStorage.removeItem('trackbridge_user');
};
