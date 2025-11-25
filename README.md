# Gloss Girlies - E-commerce Beauty Platform

A complete e-commerce replica inspired by Purplle, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🛍️ **Product Catalog**: Browse products by category (Skincare, Makeup, Haircare, Combos)
- 🔍 **Product Search**: Functional search that filters products by name, brand, category, and description
- 🛒 **Shopping Cart**: Add, remove, and manage items in your cart with persistent storage
- 👤 **User Authentication**: Complete login and registration system with user profiles
- 💳 **Checkout Process**: Multi-step checkout with shipping address and payment method selection
- 📦 **Order Management**: Create orders, view order history, and track order status
- ⭐ **Reviews System**: Submit reviews with images and videos
- 💰 **Payment Integration**: Mock payment system supporting card and cash on delivery
- 📱 **Responsive Design**: Mobile-first design with bottom navigation
- 🎨 **Modern UI**: Clean and intuitive user interface

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── categories/      # Category pages
│   ├── products/        # Product detail pages
│   ├── cart/           # Shopping cart page
│   ├── reviews/        # Reviews page with uploads
│   └── page.tsx        # Homepage
├── components/         # React components
│   ├── TopNav.tsx      # Top navigation bar
│   ├── BottomNav.tsx   # Bottom navigation (mobile)
│   ├── HeroBanner.tsx # Hero banner carousel
│   ├── ProductGrid.tsx # Product grid component
│   └── CategorySection.tsx # Category section
├── store/              # State management
│   └── cartStore.ts    # Zustand cart store
└── data/               # Static data
    └── products.ts     # Product data
```

## Key Features

### Navigation
- Top navigation with search, login, and cart
- Bottom navigation for mobile (Home, Categories, Cart, Reviews)
- Category menu in top nav

### Shopping Experience
- Product listings with images
- Product detail pages
- Shopping cart with quantity management
- Category filtering
- Product search functionality

### User Account
- User registration and login
- User profile management
- Order history
- Order tracking with status updates

### Checkout & Orders
- Multi-step checkout process
- Shipping address collection
- Payment method selection (Card/Cash on Delivery)
- Order confirmation page
- Order tracking with tracking numbers
- Order status updates (Pending, Confirmed, Shipped, Delivered)

### Reviews
- Submit reviews with star ratings
- Upload multiple images
- Upload multiple videos
- View all reviews with media

## Technologies Used

- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Zustand**: State management
- **React Icons**: Icon library

## Build for Production

```bash
npm run build
npm start
```

## License

This project is for educational purposes.

