
const validate = require("validator");
const Inventory = require("../models/inventory");
const createToken = require("../token");


exports.addInventory = async (req, res, next) => {

 if (Array.isArray(req.body)) {
    return res.status(400).json({ error: "Array payloads are not allowed" });
  };
  const payload = req.body;
  const name = payload.name;
  const manufacturerName = payload.manufacturername;
  const type = payload.type;
  const packSizeLabel = payload.packsizelabel;
  const composition1 = payload.composition1;
  const composition2 = payload.composition2;
  const mrp = payload.mrp ? parseFloat(payload.mrp) : null;
  const stockQuantity = payload.stockquantity ? parseInt(payload.stockquantity) : null;
  const purchasePrice = payload.purchaseprice ? parseFloat(payload.purchaseprice) : null;
  const sellingPrice = payload.sellingprice ? parseFloat(payload.sellingprice) : null;
   if (mrp && (isNaN(mrp) || mrp < 0)) {
    return res.status(400).json({ error: "Invalid MRP value" });
  }
  if (stockQuantity !== null && (isNaN(stockQuantity) || stockQuantity < 0)) {
    return res.status(400).json({ error: "Invalid stock quantity" });
  }
  if (purchasePrice !== null && (isNaN(purchasePrice) || purchasePrice < 0)) {
    return res.status(400).json({ error: "Invalid purchase price" });
  }
  if (sellingPrice !== null && (isNaN(sellingPrice) || sellingPrice < 0)) {
    return res.status(400).json({ error: "Invalid selling price" });
  }
  const stockAlertThreshold = payload.stockalertthreshold;
 const expiryDate = payload.expirydate ? new Date(payload.expirydate) : null;
  if (expiryDate && isNaN(expiryDate.getTime())) {
    return res.status(400).json({ error: "Invalid expiry date format" });
  }
  const userName = payload.username;
  const insertDate = payload.insertdate;
  const updateDate = payload.updatedate;

  // Input validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: "Medicine name is required" });
  }
  if(!manufacturerName || manufacturerName.trim() === '') {
    return res.status(400).json({ error: "Manufacturer name is required" });
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
    return res.status(500).json({ error: "Internal server error occurred" });
  }
};
