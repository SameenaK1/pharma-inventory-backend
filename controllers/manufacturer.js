const validate = require("validator");
const Menufacturer = require("../models/manufacturer");
const createToken = require("../token");

exports.searchManufacturerNames = async (req, res, next) => {
  const searchTerm = req.query.name;
  console.log("searchTerm", searchTerm);

  try {
    const response = await Menufacturer.searchManufacturerNames(searchTerm);
    const manufacturers = response || [];

    if (manufacturers.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No manufacturers found matching "${searchTerm}"`,
        data: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Found ${manufacturers.length} manufacturer(s) matching "${searchTerm}"`,
      data: manufacturers,
      // Consider adding pagination info for future scalability
      pagination: {
        page: 1,
        limit: 50,
        total: manufacturers.length
      }
    });
  } catch (err) {
    // Consider adding more specific error logging
    console.error(`Manufacturer search error for term "${searchTerm}":`, err);
    return res.status(500).json({ 
      error: "Internal server error",
      // Consider adding error ID for tracking
      errorId: Date.now()
    });
  }
};
