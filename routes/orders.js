const express = require("express");
const { body, validationResult } = require("express-validator");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Create new order (buyer only)
router.post(
  "/",
  auth,
  requireRole(["buyer"]),
  [
    body("products")
      .isArray({ min: 1 })
      .withMessage("At least one product is required"),
    body("products.*.product")
      .isMongoId()
      .withMessage("Valid product ID is required"),
    body("products.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("shippingAddress")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Shipping address must be at least 10 characters long"),
    body("paymentMethod")
      .isIn(["cash", "card", "online"])
      .withMessage("Invalid payment method"),
    body("notes").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { products, shippingAddress, paymentMethod, notes } = req.body;

      // Validate products and get current prices
      const orderProducts = [];
      let totalAmount = 0;

      for (const item of products) {
        const product = await Product.findById(item.product);

        if (!product) {
          return res
            .status(404)
            .json({ message: `Product ${item.product} not found` });
        }

        if (!product.isAvailable || product.isBlocked) {
          return res
            .status(400)
            .json({ message: `Product ${product.name} is not available` });
        }

        if (product.quantity < item.quantity) {
          return res
            .status(400)
            .json({ message: `Insufficient quantity for ${product.name}` });
        }

        orderProducts.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price,
        });

        totalAmount += product.price * item.quantity;

        // Update product quantity
        await Product.findByIdAndUpdate(product._id, {
          $inc: { quantity: -item.quantity },
        });
      }

      // Create order
      const order = new Order({
        buyer: req.user._id,
        products: orderProducts,
        totalAmount,
        shippingAddress,
        paymentMethod,
        notes,
      });

      await order.save();

      const populatedOrder = await Order.findById(order._id)
        .populate("buyer", "name email")
        .populate("products.product", "name image");

      res.status(201).json({
        message: "Order placed successfully",
        order: populatedOrder,
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get buyer's orders
router.get(
  "/buyer/my-orders",
  auth,
  requireRole(["buyer"]),
  async (req, res) => {
    try {
      const orders = await Order.find({ buyer: req.user._id })
        .populate("products.product", "name image")
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      console.error("Get buyer orders error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get farmer's orders (orders for their products)
router.get(
  "/farmer/my-orders",
  auth,
  requireRole(["farmer"]),
  async (req, res) => {
    try {
      // Get all products by this farmer
      const farmerProducts = await Product.find({ farmer: req.user._id });
      const productIds = farmerProducts.map((p) => p._id);

      // Find orders containing these products
      const orders = await Order.find({
        "products.product": { $in: productIds },
      })
        .populate("buyer", "name email")
        .populate("products.product", "name image")
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      console.error("Get farmer orders error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get order by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("products.product", "name image description");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to view this order
    if (
      req.user.role === "buyer" &&
      order.buyer._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    if (req.user.role === "farmer") {
      const farmerProducts = await Product.find({ farmer: req.user._id });
      const productIds = farmerProducts.map((p) => p._id);
      const hasProduct = order.products.some((item) =>
        productIds.includes(item.product._id)
      );

      if (!hasProduct) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this order" });
      }
    }

    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order status (farmer only)
router.patch(
  "/:id/status",
  auth,
  requireRole(["farmer"]),
  [
    body("status")
      .isIn(["confirmed", "shipped", "delivered"])
      .withMessage("Invalid status"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if farmer has products in this order
      const farmerProducts = await Product.find({ farmer: req.user._id });
      const productIds = farmerProducts.map((p) => p._id.toString());
      const hasProduct = order.products.some((item) =>
        productIds.includes(item.product.toString())
      );

      // Debug logging
      console.log("🔍 Order Update Authorization Debug:", {
        farmerId: req.user._id.toString(),
        farmerProducts: farmerProducts.map((p) => ({
          id: p._id.toString(),
          name: p.name,
        })),
        orderProducts: order.products.map((item) => ({
          productId: item.product.toString(),
          quantity: item.quantity,
        })),
        productIds: productIds,
        hasProduct: hasProduct,
      });

      if (!hasProduct) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this order" });
      }

      order.status = status;
      await order.save();

      const updatedOrder = await Order.findById(order._id)
        .populate("buyer", "name email")
        .populate("products.product", "name image");

      res.json({
        message: "Order status updated successfully",
        order: updatedOrder,
      });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Cancel order (buyer only, if status is pending)
router.patch("/:id/cancel", auth, requireRole(["buyer"]), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled at this stage" });
    }

    order.status = "cancelled";
    await order.save();

    // Restore product quantities
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity },
      });
    }

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
