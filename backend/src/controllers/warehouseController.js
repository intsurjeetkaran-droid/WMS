/**
 * Warehouse Controller
 * Manages warehouse structure: Warehouse → Zone → Rack → Shelf → Bin
 */

const Warehouse = require('../models/Warehouse');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { createAuditLog, getRequestMeta } = require('../utils/auditLogger');

const getWarehouses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];

    const total = await Warehouse.countDocuments(query);
    const warehouses = await Warehouse.find(query)
      .populate('manager', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return paginatedResponse(res, 'Warehouses fetched.', { warehouses }, {
      total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id).populate('manager', 'name email');
    if (!warehouse) return errorResponse(res, 'Warehouse not found.', 404);
    return successResponse(res, 'Warehouse fetched.', { warehouse });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const createWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.create(req.body);

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'CREATE',
      module: 'WAREHOUSE',
      description: `Warehouse created: ${warehouse.name} (${warehouse.code})`,
      after: { name: warehouse.name, code: warehouse.code },
      ...getRequestMeta(req),
      resourceId: warehouse._id.toString(),
    });

    return successResponse(res, 'Warehouse created.', { warehouse }, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const before = await Warehouse.findById(req.params.id);
    if (!before) return errorResponse(res, 'Warehouse not found.', 404);

    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'UPDATE',
      module: 'WAREHOUSE',
      description: `Warehouse updated: ${warehouse.name}`,
      before: { name: before.name },
      after: { name: warehouse.name },
      ...getRequestMeta(req),
      resourceId: warehouse._id.toString(),
    });

    return successResponse(res, 'Warehouse updated.', { warehouse });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Add zone to warehouse
const addZone = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return errorResponse(res, 'Warehouse not found.', 404);

    warehouse.zones.push(req.body);
    await warehouse.save();

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'UPDATE',
      module: 'WAREHOUSE',
      description: `Zone added to ${warehouse.name}: ${req.body.name}`,
      ...getRequestMeta(req),
      resourceId: warehouse._id.toString(),
    });

    return successResponse(res, 'Zone added.', { warehouse });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Add rack to zone
const addRack = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return errorResponse(res, 'Warehouse not found.', 404);

    const zone = warehouse.zones.id(req.params.zoneId);
    if (!zone) return errorResponse(res, 'Zone not found.', 404);

    zone.racks.push(req.body);
    await warehouse.save();

    return successResponse(res, 'Rack added.', { warehouse });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all bin locations as flat list
const getBinLocations = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return errorResponse(res, 'Warehouse not found.', 404);

    const bins = [];
    warehouse.zones.forEach((zone) => {
      zone.racks.forEach((rack) => {
        rack.shelves.forEach((shelf) => {
          shelf.bins.forEach((bin) => {
            bins.push({
              id: bin._id,
              path: `${zone.code}-${rack.code}-${shelf.code}-${bin.code}`,
              zone: zone.name,
              rack: rack.name,
              shelf: shelf.name,
              bin: bin.name,
              capacity: bin.capacity,
              currentLoad: bin.currentLoad,
              isActive: bin.isActive,
            });
          });
        });
      });
    });

    return successResponse(res, 'Bin locations fetched.', { bins });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getWarehouses, getWarehouse, createWarehouse, updateWarehouse, addZone, addRack, getBinLocations };
