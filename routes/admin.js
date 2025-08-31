const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

// All admin routes require admin role
router.use(auth, requireRole(["admin"]));

// Get all users
router.get("/users", async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    let query = {};
    if (role && role !== "all") {
      query.role = role;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all products
router.get("/products", async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;

    let query = {};
    if (category && category !== "all") {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate("farmer", "name email")
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

// Get all orders
router.get("/orders", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate("buyer", "name email")
      .populate("products.product", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Block/Unblock user
router.patch("/users/:id/block", async (req, res) => {
  try {
    const { isBlocked } = req.body;

    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({ message: "isBlocked must be a boolean" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot block admin users" });
    }

    user.isBlocked = isBlocked;
    await user.save();

    res.json({
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    console.error("Block user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Block/Unblock product
router.patch("/products/:id/block", async (req, res) => {
  try {
    const { isBlocked } = req.body;

    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({ message: "isBlocked must be a boolean" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isBlocked = isBlocked;
    await product.save();

    res.json({
      message: `Product ${isBlocked ? "blocked" : "unblocked"} successfully`,
      product: {
        id: product._id,
        name: product.name,
        isBlocked: product.isBlocked,
      },
    });
  } catch (error) {
    console.error("Block product error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get dashboard statistics
router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: "farmer" });
    const totalBuyers = await User.countDocuments({ role: "buyer" });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({
      isAvailable: true,
      isBlocked: false,
    });
    const blockedProducts = await Product.countDocuments({ isBlocked: true });

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const completedOrders = await Order.countDocuments({ status: "delivered" });

    // Calculate total revenue
    const orders = await Order.find({ status: "delivered" });
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("farmer", "name");
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("buyer", "name");

    res.json({
      statistics: {
        users: {
          total: totalUsers,
          farmers: totalFarmers,
          buyers: totalBuyers,
          blocked: blockedUsers,
        },
        products: {
          total: totalProducts,
          available: availableProducts,
          blocked: blockedProducts,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
        },
        revenue: totalRevenue,
      },
      recentActivity: {
        users: recentUsers,
        products: recentProducts,
        orders: recentOrders,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user (admin only)
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    // Delete user's products if they're a farmer
    if (user.role === "farmer") {
      await Product.deleteMany({ farmer: user._id });
    }

    // Delete user's orders if they're a buyer
    if (user.role === "buyer") {
      await Order.deleteMany({ buyer: user._id });
    }

    await User.findByIdAndDelete(user._id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete product (admin only)
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(product._id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
