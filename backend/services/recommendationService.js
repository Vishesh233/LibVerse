const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

/**
 * Get book recommendations from AI service
 * @param {String} userId - User ID
 * @param {Number} limit - Number of recommendations
 */
const getRecommendations = async (userId, limit = 5) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/recommend`, {
      user_id: userId,
      limit,
    });

    return response.data.recommendations || [];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};

module.exports = { getRecommendations };
