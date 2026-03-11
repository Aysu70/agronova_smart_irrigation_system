const mongoose = require('mongoose');

const shopProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'sensors',
        'controllers',
        'irrigation-hardware',
        'pumps',
        'power-modules',
        'tanks',
        'accessories',
      ],
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
      // Examples: 'soil-moisture-sensor', 'temperature-sensor', 'arduino-controller', etc.
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      // Will vary by product type
    },
    stockQuantity: {
      type: Number,
      default: 100,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: '/images/product-default.jpg',
    },
    images: [String],
    manufacturer: String,
    warranty: {
      duration: String,
      coverage: [String],
    },
    compatibility: [String], // Compatible with which packages/controllers
    powerRequirement: String, // e.g., "5V DC 2A", "12V", "220V AC"
    dataSheet: String, // URL to PDF
    quantity: {
      unitLabel: {
        type: String,
        default: 'piece',
      },
      minOrder: {
        type: Number,
        default: 1,
      },
    },
    tags: [String],
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ShopProduct', shopProductSchema);
