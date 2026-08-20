const Billing = require("../models/billing");

exports.getBatchNumbers = async (req, res, next) => {
  try {
    const name = req.query.name;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Medicine name is required" });
    }
console.log(`Fetching batch numbers for medicine: ${name} and user: ${req.user?.email}`);
    const batchNumbers = await Billing.getBatchNumbersByName(name.trim(),  req.user?.email);

    if (!batchNumbers || batchNumbers.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No batch numbers found for medicine "${name}"`,
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      message: `Loaded batch numbers for "${name}"`,
      data: batchNumbers
    });
  } catch (err) {
    console.error(`Batch number fetch error:`, err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      errorId: `ERR-${Date.now()}`
    });
  }
};

