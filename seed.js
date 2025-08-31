const mongoose = require("mongoose");
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/farmers-portal"
  )
  .then(() => console.log("Connected to MongoDB for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err));

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    console.log("Cleared existing data");

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@farmersportal.com",
      password: "admin123",
      role: "admin",
      phone: "+1234567890",
      address: "123 Admin Street, Admin City",
    });

    // Create farmer users
    const farmer1 = await User.create({
      name: "John Farmer",
      email: "john@farmer.com",
      password: "farmer123",
      role: "farmer",
      phone: "+1234567891",
      address: "456 Farm Road, Farmville",
    });

    const farmer2 = await User.create({
      name: "Sarah Grower",
      email: "sarah@grower.com",
      password: "farmer123",
      role: "farmer",
      phone: "+1234567892",
      address: "789 Garden Lane, Greenfield",
    });

    // Create buyer users
    const buyer1 = await User.create({
      name: "Mike Consumer",
      email: "mike@consumer.com",
      password: "buyer123",
      role: "buyer",
      phone: "+1234567893",
      address: "321 Market Street, City Center",
    });

    const buyer2 = await User.create({
      name: "Lisa Shopper",
      email: "lisa@shopper.com",
      password: "buyer123",
      role: "buyer",
      phone: "+1234567894",
      address: "654 Shopping Ave, Retail Town",
    });

    console.log("Created users");

    // Create products
    const products = await Product.create([
      {
        name: "Fresh Organic Tomatoes",
        description:
          "Sweet and juicy organic tomatoes, perfect for salads and cooking",
        price: 2.99,
        quantity: 50,
        category: "vegetables",
        unit: "kg",
        image:
          "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400",
        farmer: farmer1._id,
        isAvailable: true,
      },
      {
        name: "Golden Apples",
        description:
          "Crisp and sweet golden apples, great for eating fresh or baking",
        price: 1.99,
        quantity: 100,
        category: "fruits",
        unit: "kg",
        image:
          "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
        farmer: farmer1._id,
        isAvailable: true,
      },
      {
        name: "Whole Grain Wheat",
        description:
          "Premium quality whole grain wheat, perfect for bread making",
        price: 3.49,
        quantity: 200,
        category: "grains",
        unit: "kg",
        image:
          "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
        farmer: farmer2._id,
        isAvailable: true,
      },
      {
        name: "Fresh Milk",
        description: "Pure and fresh milk from grass-fed cows, delivered daily",
        price: 4.99,
        quantity: 30,
        category: "dairy",
        unit: "liters",
        image:
          "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
        farmer: farmer2._id,
        isAvailable: true,
      },
      {
        name: "Organic Carrots",
        description: "Sweet and crunchy organic carrots, rich in vitamins",
        price: 1.79,
        quantity: 75,
        category: "vegetables",
        unit: "kg",
        image:
          "https://images.unsplash.com/photo-1447175008436-170170e0a221?w=400",
        farmer: farmer1._id,
        isAvailable: true,
      },
      {
        name: "Fresh Strawberries",
        description: "Sweet and juicy strawberries, perfect for desserts",
        price: 5.99,
        quantity: 40,
        category: "fruits",
        unit: "kg",
        image:
          "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400",
        farmer: farmer2._id,
        isAvailable: true,
      },
    ]);

    console.log("Created products");

    // Create orders
    const orders = await Order.create([
      {
        buyer: buyer1._id,
        products: [
          {
            product: products[0]._id,
            quantity: 2,
            price: products[0].price,
          },
          {
            product: products[1]._id,
            quantity: 1,
            price: products[1].price,
          },
        ],
        totalAmount: products[0].price * 2 + products[1].price,
        shippingAddress: "321 Market Street, City Center",
        paymentMethod: "card",
        status: "confirmed",
        paymentStatus: "paid",
      },
      {
        buyer: buyer2._id,
        products: [
          {
            product: products[2]._id,
            quantity: 3,
            price: products[2].price,
          },
        ],
        totalAmount: products[2].price * 3,
        shippingAddress: "654 Shopping Ave, Retail Town",
        paymentMethod: "cash",
        status: "pending",
        paymentStatus: "pending",
      },
    ]);

    console.log("Created orders");

    // Update product quantities after orders
    await Product.findByIdAndUpdate(products[0]._id, {
      $inc: { quantity: -2 },
    });
    await Product.findByIdAndUpdate(products[1]._id, {
      $inc: { quantity: -1 },
    });
    await Product.findByIdAndUpdate(products[2]._id, {
      $inc: { quantity: -3 },
    });

    console.log("Updated product quantities");

    console.log("Seed data created successfully!");
    console.log("\nSample login credentials:");
    console.log("Admin: admin@farmersportal.com / admin123");
    console.log("Farmer: john@farmer.com / farmer123");
    console.log("Buyer: mike@consumer.com / buyer123");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
