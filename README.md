# Farmers Online Trading and Selling Portal

A complete MERN stack web application that enables farmers to sell their products directly to buyers, with comprehensive admin management capabilities.

## Features

### 🔐 Authentication & Authorization

- Role-based login system (Farmer, Buyer, Admin)
- JWT authentication with bcrypt password hashing
- Secure route protection based on user roles

### 👨‍🌾 Farmer Features

- Add, edit, and delete products
- Upload product images
- Track orders for their products
- Update order statuses
- View sales analytics

### 🛒 Buyer Features

- Browse products with search and filtering
- Add products to shopping cart
- Place orders with shipping details
- Track order history and status
- View past purchases

### 🛡️ Admin Features

- Comprehensive dashboard with statistics
- User management (view, block/unblock, delete)
- Product moderation (view, block/unblock, delete)
- Order monitoring and analytics
- System overview and insights

### 🚀 Technical Features

- Responsive design with Tailwind CSS
- Real-time cart management
- Image upload support
- Search and filtering capabilities
- Pagination for large datasets
- Toast notifications for user feedback

## Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Express Validator** - Input validation

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd farmers-trading-portal
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

### 4. Environment Setup

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/farmers-portal
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 5. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
# Start MongoDB service from Services
```

### 6. Seed the database (optional)

```bash
npm run seed
```

This will create sample users:

- **Admin**: admin@farmersportal.com / admin123
- **Farmer**: john@farmer.com / farmer123
- **Buyer**: mike@consumer.com / buyer123

## Running the Application

### 1. Start the backend server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### 2. Start the frontend application

```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products

- `GET /api/products` - Get all products (with search/filtering)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Add new product (farmer only)
- `PUT /api/products/:id` - Update product (farmer only)
- `DELETE /api/products/:id` - Delete product (farmer only)
- `GET /api/products/farmer/my-products` - Get farmer's products

### Orders

- `POST /api/orders` - Create new order (buyer only)
- `GET /api/orders/buyer/my-orders` - Get buyer's orders
- `GET /api/orders/farmer/my-orders` - Get farmer's orders
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/status` - Update order status (farmer only)
- `PATCH /api/orders/:id/cancel` - Cancel order (buyer only)

### Admin

- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/products` - Get all products
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/users/:id/block` - Block/unblock user
- `PATCH /api/admin/products/:id/block` - Block/unblock product
- `DELETE /api/admin/users/:id` - Delete user
- `DELETE /api/admin/products/:id` - Delete product

## Project Structure

```
farmers-trading-portal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
├── models/                 # MongoDB schemas
├── routes/                 # API route handlers
├── middleware/             # Custom middleware
├── server.js              # Express server
├── seed.js                # Database seeding script
├── package.json
└── README.md
```

## Usage Examples

### For Farmers

1. Register/Login as a farmer
2. Add products with images, descriptions, and pricing
3. Monitor incoming orders
4. Update order statuses (confirm, ship, deliver)
5. Track sales and revenue

### For Buyers

1. Register/Login as a buyer
2. Browse available products
3. Add items to cart
4. Place orders with shipping details
5. Track order progress

### For Admins

1. Login with admin credentials
2. Monitor system statistics
3. Manage users (block/unblock, delete)
4. Moderate products (block/unblock, delete)
5. View order analytics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

## Future Enhancements

- Real-time notifications
- Payment gateway integration
- Mobile app development
- Advanced analytics dashboard
- Multi-language support
- Push notifications
- Advanced search with AI
- Inventory management system
- Shipping integration
- Review and rating system
