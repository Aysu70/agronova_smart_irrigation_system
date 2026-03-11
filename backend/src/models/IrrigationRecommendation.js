const mongoose = require('mongoose');

const irrigationRecommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    landInformation: {
      area: {
        type: Number,
        required: true, // in m²
      },
      unit: {
        type: String,
        enum: ['m²', 'hectares'],
        default: 'm²',
      },
      cropType: {
        type: String,
        enum: ['vegetables', 'fruit-trees', 'greenhouse', 'grass-landscaping'],
        required: true,
      },
      waterSource: {
        type: String,
        enum: ['well', 'water-tank', 'canal', 'municipal-supply'],
        required: true,
      },
      powerAvailability: {
        type: String,
        enum: ['electricity', 'solar', 'none'],
        required: true,
      },
      soilType: String,
      climate: String,
      location: {
        latitude: Number,
        longitude: Number,
        region: String,
      },
    },
    recommendedPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IrrigationPackage',
      required: true,
    },
    recommendedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShopProduct',
      },
    ],
    recommendationScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    reasonsForRecommendation: [String],
    estimatedCost: {
      basePackagePrice: Number,
      additionalComponents: Number,
      totalEstimated: Number,
      currency: {
        type: String,
        default: 'USD',
      },
    },
    customizationSuggestions: [
      {
        suggestion: String,
        additionalCost: Number,
        priority: String, // 'low', 'medium', 'high'
      },
    ],
    waterSavingsPotential: {
      estimatedSavingsPercentage: Number,
      estimatedSavingsPerSeason: String, // e.g., "5000-7000 liters"
    },
    status: {
      type: String,
      enum: ['pending', 'sent-to-cart', 'ordered', 'dismissed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'IrrigationRecommendation',
  irrigationRecommendationSchema
);
