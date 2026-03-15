import axios from 'axios';

/**
 * @param {import('../types/index.js').RecommendationRequest} params
 * @returns {Promise<import('../types/index.js').RecommendationResponse>}
 */
export const fetchRecommendation = (params) =>
  axios.post('/api/recommendations', params).then(r => r.data);

/**
 * @param {import('../types/index.js').ReservationRequest} body
 * @returns {Promise<void>}
 */
export const createReservation = (body) =>
  axios.post('/api/reservations', body).then(r => r.data);

/**
 * @param {string} date
 * @param {string} start
 * @param {string} end
 * @returns {Promise<import('../types/index.js').Table[]>}
 */
export const fetchTables = (date, start, end) =>
  axios.get('/api/tables', { params: { date, start, end } }).then(r => r.data);

/**
 * @returns {Promise<{name: string, category?: string, area?: string, thumbnailUrl?: string}>}
 */
export const fetchMealSuggestion = () =>
  axios.get('/api/meals/suggestion').then(r => r.data);
