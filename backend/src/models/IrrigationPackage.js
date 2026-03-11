const mongoose = require('mongoose');

const irrigationPackageSchema = new mongoose.Schema(
  {
    packageId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      enum: ['Basic Smart Irrigation Kit', 'Advanced Farm Kit', 'Professional Smart Farm System'],
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['basic', 'advanced', 'professional'],
      required: true,
    },
    suitableFor: {
      minArea: {
        type: Number,
        required: true, // in m²
      },
      maxArea: {
        type: Number,
        required: true, // in m²
      },
      description: String,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    features: [
      {
        name: String,
        description: String,
        quantity: Number,
      },
    ],
    components: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShopProduct',
      },
    ],
    specifications: {
      waterFlow: String, // L/hour or GPM
      coverage: String, // m² or hectares
      sensors: Number,
      controlMethod: [String], // ['Manual', 'Automated', 'Mobile-App', 'AI-Based']
      powerRequirement: String,
      waterSource: [String], // ['Well', 'Tank', 'Canal', 'Municipal']
    },
    stockQuantity: {
      type: Number,
      default: 50,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: '/images/irrigation-package-default.jpg',
    },
    benefits: [String],
    installation: {
      difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium',
      },
      timeRequired: String, // e.g., "2-3 hours"
      requiresProfessional: Boolean,
    },
    warranty: {
      duration: String, // e.g., "2 years"
      coverage: [String],
    },
    supportedCrops: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('IrrigationPackage', irrigationPackageSchema);
