const IrrigationPackage = require('../models/IrrigationPackage');
const ShopProduct = require('../models/ShopProduct');
const IrrigationRecommendation = require('../models/IrrigationRecommendation');
const User = require('../models/User');

// @desc    Get all irrigation packages
// @route   GET /api/shop/packages
// @access  Public
exports.getPackages = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sortBy } = req.query;

    let query = { inStock: true };

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const packages = await IrrigationPackage.find(query)
      .populate('components')
      .sort(sortBy === 'price' ? { price: 1 } : { createdAt: -1 });

    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
    });
  }
};

// @desc    Get single package
// @route   GET /api/shop/packages/:id
// @access  Public
exports.getPackage = async (req, res) => {
  try {
    const pkg = await IrrigationPackage.findById(req.params.id).populate(
      'components'
    );

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    res.status(200).json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package',
    });
  }
};

// @desc    Get all shop products
// @route   GET /api/shop/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      minPrice,
      maxPrice,
      inStockOnly,
      featured,
      sortBy,
      search,
    } = req.query;

    let query = {};

    if (inStockOnly === 'true') query.inStock = true;
    if (featured === 'true') query.featured = true;
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await ShopProduct.find(query).sort(
      sortBy === 'price' ? { price: 1 } : { createdAt: -1 }
    );

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

// @desc    Get single product
// @route   GET /api/shop/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await ShopProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
  }
};

// @desc    Get smart irrigation recommendation
// @route   POST /api/shop/recommend
// @access  Private
exports.getRecommendation = async (req, res) => {
  try {
    const {
      area,
      unit = 'm²',
      cropType,
      waterSource,
      powerAvailability,
      soilType,
      location,
    } = req.body;

    // Validate input
    if (!area || !cropType || !waterSource || !powerAvailability) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Convert area to m² if needed
    let areaInSqM = area;
    if (unit === 'hectares') {
      areaInSqM = area * 10000;
    }

    // Find suitable package based on area
    let recommendedCategory;
    if (areaInSqM <= 500) {
      recommendedCategory = 'basic';
    } else if (areaInSqM <= 2000) {
      recommendedCategory = 'advanced';
    } else {
      recommendedCategory = 'professional';
    }

    // Get the recommended package
    const pkg = await IrrigationPackage.findOne({
      category: recommendedCategory,
    }).populate('components');

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'No suitable package found',
      });
    }

    // Find additional products based on specific needs
    let additionalProducts = [];

    // Add extra sensors based on area
    if (areaInSqM > 1000) {
      const temperatureSensor = await ShopProduct.findOne({
        subcategory: 'temperature-sensor',
      });
      if (temperatureSensor) additionalProducts.push(temperatureSensor._id);
    }

    // Add solar module if no electricity
    if (powerAvailability === 'solar' || powerAvailability === 'none') {
      const solarModule = await ShopProduct.findOne({
        category: 'power-modules',
        subcategory: { $regex: 'solar' },
      });
      if (solarModule) additionalProducts.push(solarModule._id);
    }

    // Calculate recommendation score
    const scoreFactors = {
      areaMatch: areaInSqM >= pkg.suitableFor.minArea && 
                 areaInSqM <= pkg.suitableFor.maxArea ? 25 : 20,
      cropCompatibility: pkg.supportedCrops.includes(cropType) ? 25 : 15,
      waterSourceSupport: 25,
      powerAlignment: powerAvailability !== 'none' ? 25 : 15,
    };
    const recommendationScore = Object.values(scoreFactors).reduce((a, b) => a + b, 0);

    // Create recommendation
    const recommendation = await IrrigationRecommendation.create({
      user: req.user.id,
      landInformation: {
        area: areaInSqM,
        unit: 'm²',
        cropType,
        waterSource,
        powerAvailability,
        soilType,
        location,
      },
      recommendedPackage: pkg._id,
      recommendedProducts: additionalProducts,
      recommendationScore,
      reasonsForRecommendation: [
        `${pkg.name} is optimal for ${areaInSqM} m² farms`,
        `Includes ${pkg.features.length} key features for ${cropType} farming`,
        `Supports ${waterSource} water sources`,
        `Compatible with ${powerAvailability} power setup`,
      ],
      estimatedCost: {
        basePackagePrice: pkg.price,
        additionalComponents: additionalProducts.length * 50, // Rough estimate
        totalEstimated: pkg.price + additionalProducts.length * 50,
        currency: pkg.currency,
      },
      waterSavingsPotential: {
        estimatedSavingsPercentage: 30 + (areaInSqM / 100) * 0.5,
        estimatedSavingsPerSeason: `${areaInSqM * 5}-${areaInSqM * 8} liters`,
      },
    });

    // Populate fields
    await recommendation.populate('recommendedPackage').populate('recommendedProducts');

    res.status(201).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error('Error getting recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendation',
    });
  }
};

// @desc    Get user's recommendations
// @route   GET /api/shop/recommendations
// @access  Private
exports.getUserRecommendations = async (req, res) => {
  try {
    const recommendations = await IrrigationRecommendation.find({
      user: req.user.id,
    })
      .populate('recommendedPackage')
      .populate('recommendedProducts')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
    });
  }
};

// @desc    Get featured products
// @route   GET /api/shop/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await ShopProduct.find({ featured: true, inStock: true })
      .limit(6)
      .sort({ rating: -1 });

    const packages = await IrrigationPackage.find({ inStock: true })
      .limit(3)
      .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      data: {
        featuredProducts: products,
        popularPackages: packages,
      },
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
    });
  }
};

// @desc    Get product categories with counts
// @route   GET /api/shop/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await ShopProduct.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
      { $sort: { category: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
};
