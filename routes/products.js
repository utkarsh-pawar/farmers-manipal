const express = require("express");
const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Get all available products (public)
router.get("/", async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;

    let query = { isAvailable: true, isBlocked: false };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== "all") {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate("farmer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get product by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "farmer",
      "name phone address"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.isAvailable || product.isBlocked) {
      return res.status(404).json({ message: "Product not available" });
    }

    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new product (farmer only)
router.post(
  "/",
  auth,
  requireRole(["farmer"]),
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("description")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Description must be at least 10 characters"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("category")
      .isIn(["vegetables", "fruits", "grains", "dairy", "meat", "other"])
      .withMessage("Invalid category"),
    body("unit")
      .isIn(["kg", "g", "pieces", "liters", "dozen"])
      .withMessage("Invalid unit"),
    body("image").notEmpty().withMessage("Image is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = new Product({
        ...req.body,
        farmer: req.user._id,
      });

      await product.save();

      const populatedProduct = await Product.findById(product._id).populate(
        "farmer",
        "name"
      );

      res.status(201).json({
        message: "Product added successfully",
        product: populatedProduct,
      });
    } catch (error) {
      console.error("Add product error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update product (farmer only, their own products)
router.put(
  "/:id",
  auth,
  requireRole(["farmer"]),
  [
    body("name").optional().trim().isLength({ min: 2 }),
    body("description").optional().trim().isLength({ min: 10 }),
    body("price").optional().isFloat({ min: 0 }),
    body("quantity").optional().isInt({ min: 1 }),
    body("category")
      .optional()
      .isIn(["vegetables", "fruits", "grains", "dairy", "meat", "other"]),
    body("unit").optional().isIn(["kg", "g", "pieces", "liters", "dozen"]),
    body("image").optional().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.farmer.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this product" });
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate("farmer", "name");

      res.json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete product (farmer only, their own products)
router.delete("/:id", auth, requireRole(["farmer"]), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.farmer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get farmer's products
router.get(
  "/farmer/my-products",
  auth,
  requireRole(["farmer"]),
  async (req, res) => {
    try {
      const products = await Product.find({ farmer: req.user._id }).sort({
        createdAt: -1,
      });

      res.json(products);
    } catch (error) {
      console.error("Get farmer products error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
