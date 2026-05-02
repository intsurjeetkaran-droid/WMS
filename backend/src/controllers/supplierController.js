/**
 * Supplier Controller
 * CRUD for supplier management
 */

const Supplier = require('../models/Supplier');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { createAuditLog, getRequestMeta } = require('../utils/auditLogger');

const getSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const total = await Supplier.countDocuments(query);
    const suppliers = await Supplier.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return paginatedResponse(res, 'Suppliers fetched.', { suppliers }, {
      total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return errorResponse(res, 'Supplier not found.', 404);
    return successResponse(res, 'Supplier fetched.', { supplier });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const createSupplier = async (req, res) => {
  try {
    const supplierData = { ...req.body, createdBy: req.user._id };
    if (!supplierData.code) {
      const count = await Supplier.countDocuments();
      supplierData.code = `SUP-${String(count + 1).padStart(4, '0')}`;
    }

    const supplier = await Supplier.create(supplierData);

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'CREATE',
      module: 'SUPPLIER',
      description: `Supplier created: ${supplier.name} (${supplier.code})`,
      after: { name: supplier.name, code: supplier.code },
      ...getRequestMeta(req),
      resourceId: supplier._id.toString(),
    });

    return successResponse(res, 'Supplier created.', { supplier }, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateSupplier = async (req, res) => {
  try {
    const before = await Supplier.findById(req.params.id);
    if (!before) return errorResponse(res, 'Supplier not found.', 404);

    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'UPDATE',
      module: 'SUPPLIER',
      description: `Supplier updated: ${supplier.name}`,
      before: { name: before.name, email: before.email },
      after: { name: supplier.name, email: supplier.email },
      ...getRequestMeta(req),
      resourceId: supplier._id.toString(),
    });

    return successResponse(res, 'Supplier updated.', { supplier });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return errorResponse(res, 'Supplier not found.', 404);

    supplier.isActive = false;
    await supplier.save();

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'DELETE',
      module: 'SUPPLIER',
      description: `Supplier deactivated: ${supplier.name}`,
      ...getRequestMeta(req),
      resourceId: supplier._id.toString(),
    });

    return successResponse(res, 'Supplier deactivated.');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier };
