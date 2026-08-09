# Munch 🍔

Munch is a full-stack food ordering web application built with React, Node.js, Express, and MongoDB.

Customers can browse the menu, customize food items, manage their cart, place orders, save delivery addresses, manage their profile, and submit reviews.

The project also includes an admin panel for menu management, order management, and business analytics.

## 🚀 Live Demo

**Frontend:**  
https://munch-two-eosin.vercel.app/

**Backend API:**  
https://munch-y4gq.onrender.com/

---

## ✨ Features

### Customer Features

- User registration and login
- JWT-based authentication
- Browse menu items
- Search menu items
- Filter by category
- View menu item details
- Customize items with sizes and add-ons
- Add items to cart
- Update cart quantities
- Remove items from cart
- Favorites
- Checkout
- Saved delivery addresses
- Default address management
- Order placement
- Order history
- Order status tracking
- Re-order previous items
- Product reviews and ratings
- Edit and delete personal reviews
- Customer profile management
- Profile picture upload
- Responsive design
- PWA support

### Admin Features

- Admin authentication and authorization
- Admin dashboard
- Menu management
- Add menu items
- Edit menu items
- Mark menu items unavailable
- Search and filter menu items
- Order management
- Update order status
- Revenue analytics
- Order statistics
- Top-selling items
- Most ordered categories
- Monthly revenue
- Recent orders

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- JavaScript
- Context API
- Custom React Hooks
- Progressive Web App (PWA)

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Zod
- REST APIs

### Deployment

- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

---

## 🏗️ Project Architecture

Munch follows a client-server architecture.

```text
Munch
├── client/
│   └── React + Vite frontend
│
└── server/
    └── Node.js + Express backend
Backend Architecture

The backend follows a layered architecture:

Request
   ↓
Routes
   ↓
Middleware
   ↓
Controllers
   ↓
Services
   ↓
Models
   ↓
MongoDB
Routes define API endpoints.
Middleware handles authentication, authorization, validation, and errors.
Controllers handle HTTP requests and responses.
Services contain business logic.
Models define MongoDB document structures.
Validators validate incoming request data.
Frontend Architecture

The frontend uses reusable React components, hooks, and context.

Pages
   ↓
Components
   ↓
Hooks / Context
   ↓
API
   ↓
Backend
🔐 Authentication

Munch uses JWT-based authentication.

The basic authentication flow is:

User Login
    ↓
Backend validates credentials
    ↓
JWT generated
    ↓
Client maintains authentication state
    ↓
Protected requests include authentication
    ↓
Backend verifies JWT

Admin routes additionally check the user's role before allowing access.

🛒 Customer Order Flow
Register / Login
      ↓
Browse Menu
      ↓
View Item
      ↓
Customize Item
      ↓
Add to Cart
      ↓
Checkout
      ↓
Select Delivery Address
      ↓
Place Order
      ↓
Track Order
      ↓
Delivered
      ↓
Submit Review

Reviews can only be submitted by customers who have actually received an order containing that item.

👨‍💼 Admin Flow
Admin Login
     ↓
Admin Dashboard
     ├── Menu Management
     ├── Order Management
     └── Analytics

The admin dashboard provides information about orders, revenue, popular items, categories, and recent activity.

📊 Analytics

The admin analytics dashboard calculates metrics from real MongoDB data.

It includes:

Total orders
Today's orders
Total revenue
Today's revenue
Average order value
Order status counts
Top-selling items
Most ordered categories
Monthly revenue
Recent orders

Analytics are calculated on the server rather than using hardcoded values.

📁 Project Structure
Munch/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── config/
│   │   └── app.js
│   │
│   └── package.json
│
├── .gitignore
└── README.md
🔄 Backend Request Flow

For example, when a customer places an order:

React Checkout Page
        ↓
POST /api/v1/orders
        ↓
Authentication Middleware
        ↓
Validation Middleware
        ↓
Order Controller
        ↓
Order Service
        ↓
Order Model
        ↓
MongoDB
        ↓
Response
        ↓
React UI

This separation keeps HTTP handling, business logic, and database operations organized.

⚙️ Running Locally
1. Clone the repository
git clone 
cd Munch

Replace YOUR_GITHUB_REPOSITORY_URL with your GitHub repository URL.

2. Install backend dependencies
cd server
npm install
3. Create backend environment file

Create:

server/.env

Use server/.env.example as a reference and add the required environment variables.

4. Start the backend
npm run dev
5. Install frontend dependencies

Open another terminal:

cd client
npm install
6. Create frontend environment file

Create:

client/.env

Configure the frontend API URL according to your local backend.

7. Start the frontend
npm run dev
🔒 Environment Variables

Sensitive configuration is stored using environment variables and is not committed to GitHub.

Examples include:

MONGODB_URI
JWT_SECRET
VITE_API_BASE_URL

Never commit .env files containing secrets.

📱 Responsive Design

Munch is designed to work across:

Mobile
Tablet
Laptop
Desktop

Both customer and admin interfaces adapt to different screen sizes.

🧪 Verification

The backend was checked using:

node --check

The frontend production build was verified using:

npm run build

The application has been tested across the major customer and admin workflows.

🌐 Deployment
Frontend

Deployed on Vercel:

https://munch-two-eosin.vercel.app/

Backend

Deployed on Render:

https://munch-y4gq.onrender.com/

Database

MongoDB Atlas is used as the production database.

🎯 What I Learned

This project helped me understand:

React component architecture
React Hooks and Context API
REST API development
Express.js
MongoDB and Mongoose
JWT authentication
Authorization and protected routes
Middleware
Zod validation
CRUD operations
Controller and service architecture
API integration
State management
Order management
Reviews and ratings
Admin dashboards
Analytics
Responsive UI development
Production deployment
Debugging production issues
📌 Future Improvements

Possible future improvements include:

Real payment gateway integration
Email or SMS order notifications
Advanced reporting
Dedicated image storage
More advanced food recommendations
👩‍💻 Author

Arpita

Full-Stack Web Development Project

Munch was built as a learning-focused project to understand how a complete full-stack application works from the frontend to the backend and database.


After replacing the file, run:

```bash
git add README.md
git commit -m "Improve project README"
git push origin main