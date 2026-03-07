const axios = require('axios');

// Agriculture-related keywords for topic filtering
const agronomyKeywords = [
  'crop', 'farm', 'soil', 'plant', 'agriculture', 'irrigation', 'fertilizer',
  'pest', 'harvest', 'seed', 'weather', 'climate', 'cultivate', 'yield',
  'organic', 'compost', 'tillage', 'rotation', 'greenhouse', 'livestock',
  'dairy', 'poultry', 'vegetable', 'fruit', 'grain', 'wheat', 'rice', 'corn',
  'water', 'moisture', 'drought', 'rainfall', 'temperature', 'humidity',
  'nitrogen', 'phosphorus', 'potassium', 'pH', 'nutrient', 'disease',
  'weed', 'insect', 'fungus', 'herbicide', 'pesticide', 'growth', 'season'
];

// Check if question is agriculture-related
const isAgronomyQuestion = (question) => {
  const lowerQuestion = question.toLowerCase();
  return agronomyKeywords.some(keyword => lowerQuestion.includes(keyword));
};

// AI Chat endpoint
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Check if question is agronomy-related
    if (!isAgronomyQuestion(message)) {
      return res.status(200).json({
        success: true,
        data: {
          message: "I apologize, but I can only answer questions related to agriculture, farming, and agronomy. Please ask me about crops, soil, irrigation, fertilizers, pest control, or any other farming-related topics. How can I help you with your agricultural needs?",
          isRestricted: true
        }
      });
    }

    // If OpenAI API key is not configured, return a mock response
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return res.status(200).json({
        success: true,
        data: {
          message: getMockAgronomyResponse(message),
          isRestricted: false,
          isMock: true
        }
      });
    }

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert agricultural advisor and agronomist. Provide practical, helpful advice about farming, crops, soil management, irrigation, pest control, and sustainable agriculture practices. Be friendly, supportive, and use simple language that farmers can understand. If asked about non-agricultural topics, politely redirect to agriculture-related questions.'
          },
          ...conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiMessage = response.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      data: {
        message: aiMessage,
        isRestricted: false
      }
    });
  } catch (error) {
    console.error('AI Service Error:', error.message);
    
    // Fallback to mock response on error
    res.status(200).json({
      success: true,
      data: {
        message: getMockAgronomyResponse(req.body.message),
        isRestricted: false,
        isMock: true
      }
    });
  }
};

// Mock responses for demonstration
function getMockAgronomyResponse(question) {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('irrigation') || lowerQuestion.includes('water')) {
    return "Great question about irrigation! For optimal irrigation:\n\n1. Monitor soil moisture regularly (aim for 60-80% for most crops)\n2. Water early morning or evening to reduce evaporation\n3. Use drip irrigation for water efficiency\n4. Adjust frequency based on weather and crop stage\n5. Ensure proper drainage to prevent waterlogging\n\nYour smart irrigation system can automate this based on soil moisture sensors. Would you like specific advice for your crop type?";
  }

  if (lowerQuestion.includes('soil') || lowerQuestion.includes('fertilizer') || lowerQuestion.includes('nutrient')) {
    return "Soil health is crucial for good yields! Here are key tips:\n\n1. Test your soil pH (most crops prefer 6.0-7.0)\n2. Add organic matter like compost regularly\n3. Use balanced NPK fertilizers based on crop needs\n4. Practice crop rotation to maintain nutrients\n5. Consider cover crops to improve soil structure\n\nWould you like specific fertilizer recommendations for your crop?";
  }

  if (lowerQuestion.includes('pest') || lowerQuestion.includes('insect') || lowerQuestion.includes('disease')) {
    return "Pest and disease management is essential! Follow these integrated pest management practices:\n\n1. Monitor regularly for early detection\n2. Use resistant crop varieties when possible\n3. Maintain proper spacing for air circulation\n4. Remove infected plants promptly\n5. Use biological controls before chemicals\n6. Apply pesticides only when necessary\n\nWhat specific pest or disease are you dealing with?";
  }

  if (lowerQuestion.includes('crop') || lowerQuestion.includes('plant') || lowerQuestion.includes('grow')) {
    return "For successful crop cultivation:\n\n1. Choose varieties suitable for your climate\n2. Prepare soil properly before planting\n3. Follow recommended spacing and depth\n4. Provide adequate water and nutrients\n5. Monitor for pests and diseases\n6. Harvest at proper maturity\n\nWhat crop are you planning to grow? I can provide more specific guidance!";
  }

  if (lowerQuestion.includes('weather') || lowerQuestion.includes('climate') || lowerQuestion.includes('season')) {
    return "Weather and climate considerations:\n\n1. Plan planting based on frost dates\n2. Monitor weather forecasts regularly\n3. Protect crops during extreme conditions\n4. Adjust irrigation based on rainfall\n5. Consider season-appropriate varieties\n6. Use mulch to moderate temperature\n\nYour sensor system helps track temperature and humidity. What's your growing region?";
  }

  // Default response
  return "Thank you for your agriculture question! I'm here to help with farming advice. I can assist with:\n\n• Crop selection and cultivation\n• Soil management and fertilization\n• Irrigation strategies\n• Pest and disease control\n• Weather planning\n• Sustainable farming practices\n\nCould you provide more details about your specific situation or crop type?";
}
