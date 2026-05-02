/**
 * Product Controller
 * CRUD operations for product catalog
 * Includes QR code generation and barcode support
 */

const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { createAuditLog, getRequestMeta } = require('../utils/auditLogger');

/**
 * @desc    Get all products with pagination and search
 * @route   GET /api/products
 * @access  Private
 */
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, supplier, isActive } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = { $regex: category, $options: 'i' };
    if (supplier) query.supplier = supplier;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('supplier', 'name code email')
      .populate('createdBy', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return paginatedResponse(res, 'Products fetched.', { products }, {
      total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Private
 */
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'name code email phone')
      .populate('createdBy', 'name email');

    if (!product) return errorResponse(res, 'Product not found.', 404);

    // Get current inventory summary
    const inventorySummary = await Inventory.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          availableQuantity: { $sum: '$availableQuantity' },
          reservedQuantity: { $sum: '$reservedQuantity' },
        },
      },
    ]);

    return successResponse(res, 'Product fetched.', {
      product,
      inventory: inventorySummary[0] || { totalQuantity: 0, availableQuantity: 0, reservedQuantity: 0 },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private (inventory_manager+)
 */
const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body, createdBy: req.user._id };

    // Auto-generate SKU if not provided
    if (!productData.sku) {
      const count = await Product.countDocuments();
      productData.sku = `SKU-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    }

    const product = await Product.create(productData);

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'CREATE',
      module: 'PRODUCT',
      description: `Product created: ${product.name} (${product.sku})`,
      after: { name: product.name, sku: product.sku, category: product.category },
      ...getRequestMeta(req),
      resourceId: product._id.toString(),
    });

    return successResponse(res, 'Product created successfully.', { product }, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (inventory_manager+)
 */
const updateProduct = async (req, res) => {
  try {
    const before = await Product.findById(req.params.id);
    if (!before) return errorResponse(res, 'Product not found.', 404);

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('supplier', 'name code');

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'UPDATE',
      module: 'PRODUCT',
      description: `Product updated: ${product.name} (${product.sku})`,
      before: { name: before.name, sku: before.sku, unitPrice: before.unitPrice },
      after: { name: product.name, sku: product.sku, unitPrice: product.unitPrice },
      ...getRequestMeta(req),
      resourceId: product._id.toString(),
    });

    return successResponse(res, 'Product updated.', { product });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Delete product (soft delete)
 * @route   DELETE /api/products/:id
 * @access  Private (super_admin only)
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 'Product not found.', 404);

    // Check if product has inventory
    const inventoryCount = await Inventory.countDocuments({ product: product._id, quantity: { $gt: 0 } });
    if (inventoryCount > 0) {
      return errorResponse(res, 'Cannot delete product with existing inventory. Deactivate instead.', 400);
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'DELETE',
      module: 'PRODUCT',
      description: `Product deactivated: ${product.name} (${product.sku})`,
      before: { isActive: true },
      after: { isActive: false },
      ...getRequestMeta(req),
      resourceId: product._id.toString(),
    });

    return successResponse(res, 'Product deactivated.');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get product categories
 * @route   GET /api/products/categories
 * @access  Private
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    return successResponse(res, 'Categories fetched.', { categories });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Search product by barcode/SKU (for scan)
 * @route   GET /api/products/scan/:code
 * @access  Private
 */
const scanProduct = async (req, res) => {
  try {
    const { code } = req.params;
    const product = await Product.findOne({
      $or: [{ sku: code.toUpperCase() }, { barcode: code }],
      isActive: true,
    }).populate('supplier', 'name');

    if (!product) return errorResponse(res, 'Product not found for this code.', 404);

    const inventory = await Inventory.find({ product: product._id })
      .populate('warehouse', 'name code');

    return successResponse(res, 'Product found.', { product, inventory });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories, scanProduct };
