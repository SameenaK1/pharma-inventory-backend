
const validate = require("validator");
const Inventory = require("../models/inventory");
const createToken = require("../token");


exports.addInventory = async (req, res, next) => {
  // Handle array payload by extracting the first item
  const payload = Array.isArray(req.body) ? req.body[0] : req.body;
  
  const name = payload.name;
  const manufacturerName = payload.manufacturername;
  const type = payload.type;
  const packSizeLabel = payload.packsizelabel;
  const composition1 = payload.composition1;
  const composition2 = payload.composition2;
  const mrp = payload.mrp;
  const stockQuantity = payload.stockquantity;
  const purchasePrice = payload.purchaseprice;
  const sellingPrice = payload.sellingprice;
  const stockAlertThreshold = payload.stockalertthreshold;
  const expiryDate = payload.expirydate;
  const userName = payload.username;
  const insertDate = payload.insertdate;
  const updateDate = payload.updatedate;

  // Input validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: "Medicine name is required" });
  }

  try {
    const new_inventory = new Inventory(name, manufacturerName, type, packSizeLabel, composition1, composition2, mrp, stockQuantity, purchasePrice, sellingPrice, stockAlertThreshold, expiryDate, userName, insertDate, updateDate);
    const response = await new_inventory.addInventory();

    const insertId = response[0]?.insertId || response.insertId;

    return res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      insertedId: insertId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};