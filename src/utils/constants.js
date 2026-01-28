// Location: src/utils/constants.js

// App Configuration
export const APP_NAME = 'Aruviah';
export const APP_DESCRIPTION = 'Your one-stop shop for quality products';
export const APP_VERSION = '1.0.0';

// Currency
export const CURRENCY = 'KES';
export const CURRENCY_SYMBOL = 'KSh';

// Shipping
export const FREE_SHIPPING_THRESHOLD = 5000;
export const STANDARD_SHIPPING_FEE = 300;

// Pagination
export const PRODUCTS_PER_PAGE = 20;
export const ORDERS_PER_PAGE = 10;
export const REVIEWS_PER_PAGE = 10;

// Product Ratings
export const MAX_RATING = 5;
export const MIN_RATING = 1;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded'
};

export const ORDER_STATUS_COLORS = {
  pending: 'orange',
  processing: 'blue',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'red',
  refunded: 'gray'
};

// Payment Methods
export const PAYMENT_METHODS = {
  MPESA: 'mpesa',
  CARD: 'card',
  COD: 'cod',
  PAYPAL: 'paypal'
};

export const PAYMENT_METHOD_LABELS = {
  mpesa: 'M-Pesa',
  card: 'Credit/Debit Card',
  cod: 'Cash on Delivery',
  paypal: 'PayPal'
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin'
};

// Product Categories
export const CATEGORIES = [
  // Main Categories
  { id: 'electronics', name: 'Electronics', icon: 'FiSmartphone' },
  { id: 'fashion-apparel', name: 'Fashion & Apparel', icon: 'FiShoppingBag' },
  { id: 'home-garden', name: 'Home & Garden', icon: 'FiHome' },
  { id: 'sports-outdoors', name: 'Sports & Outdoors', icon: 'FiActivity' },
  { id: 'health-beauty', name: 'Health & Beauty', icon: 'FiHeart' },
  { id: 'books-media', name: 'Books & Media', icon: 'FiBook' },
  { id: 'toys-games', name: 'Toys & Games', icon: 'FiCoast' },
  { id: 'automotive', name: 'Automotive', icon: 'FiTruck' },
  { id: 'grocery-food', name: 'Grocery & Food', icon: 'FiShoppingCart' },
  { id: 'pet-supplies', name: 'Pet Supplies', icon: 'FiFilter' },
  { id: 'baby-kids', name: 'Baby & Kids', icon: 'FiAward' },
  { id: 'jewelry-accessories', name: 'Jewelry & Accessories', icon: 'FiStar' },
  { id: 'office-supplies', name: 'Office Supplies', icon: 'FiClipboard' },
  { id: 'tools-home-improvement', name: 'Tools & Home Improvement', icon: 'FiTool' },
  { id: 'arts-crafts', name: 'Arts & Crafts', icon: 'FiEdit2' },
  { id: 'music-instruments', name: 'Music & Instruments', icon: 'FiMusic' },
  { id: 'industrial-scientific', name: 'Industrial & Scientific', icon: 'FiZap' },
  { id: 'collectibles-antiques', name: 'Collectibles & Antiques', icon: 'FiGift' },
  
  // Additional Specialized Categories
  { id: 'furniture', name: 'Furniture', icon: 'FiHome' },
  { id: 'appliances', name: 'Appliances', icon: 'FiZap' },
  { id: 'outdoor-camping', name: 'Outdoor & Camping', icon: 'FiCloud' },
  { id: 'fitness-exercise', name: 'Fitness & Exercise Equipment', icon: 'FiActivity' },
  { id: 'video-games-consoles', name: 'Video Games & Consoles', icon: 'FiCoast' },
  { id: 'cell-phones-accessories', name: 'Cell Phones & Accessories', icon: 'FiSmartphone' },
  { id: 'cameras-photography', name: 'Cameras & Photography', icon: 'FiCamera' },
  { id: 'software-digital', name: 'Software & Digital Downloads', icon: 'FiDownload' },
  { id: 'movies-tv-shows', name: 'Movies & TV Shows', icon: 'FiFilm' },
  { id: 'shoes-footwear', name: 'Shoes & Footwear', icon: 'FiPieChart' },
  { id: 'watches', name: 'Watches', icon: 'FiWatch' },
  { id: 'luggage-travel', name: 'Luggage & Travel Gear', icon: 'FiAirplay' },
  { id: 'party-supplies', name: 'Party Supplies & Events', icon: 'FiBalloon' },
  { id: 'seasonal-holiday', name: 'Seasonal & Holiday Items', icon: 'FiTree' },
  { id: 'gift-cards', name: 'Gift Cards', icon: 'FiGift' },
  
  // Niche Categories
  { id: 'handmade-artisan', name: 'Handmade & Artisan Goods', icon: 'FiEdit' },
  { id: 'vintage-used', name: 'Vintage & Used Items', icon: 'FiRotateCw' },
  { id: 'sustainable-eco', name: 'Sustainable & Eco-Friendly Products', icon: 'FiLeaf' },
  { id: 'smart-home-iot', name: 'Smart Home & IoT Devices', icon: 'FiHome' },
  { id: 'medical-supplies', name: 'Medical Supplies & Equipment', icon: 'FiHeartCircle' },
  { id: 'professional-services', name: 'Professional Services', icon: 'FiBriefcase' },
  { id: 'subscriptions-memberships', name: 'Subscriptions & Memberships', icon: 'FiCheck' }
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
  { value: 'rating', label: 'Highest Rated' }
];

// Price Ranges
export const PRICE_RANGES = [
  { min: 0, max: 1000, label: 'Under KSh 1,000' },
  { min: 1000, max: 5000, label: 'KSh 1,000 - 5,000' },
  { min: 5000, max: 10000, label: 'KSh 5,000 - 10,000' },
  { min: 10000, max: 50000, label: 'KSh 10,000 - 50,000' },
  { min: 50000, max: Infinity, label: 'Over KSh 50,000' }
];

// Time Constants
export const DELIVERY_TIME = '3-5 business days';
export const RETURN_PERIOD = 7; // days
export const WARRANTY_PERIOD = 30; // days

// Validation
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 50;
export const MIN_PRODUCT_NAME_LENGTH = 3;
export const MAX_PRODUCT_NAME_LENGTH = 100;
export const MIN_DESCRIPTION_LENGTH = 10;
export const MAX_DESCRIPTION_LENGTH = 2000;

// Image Upload
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
export const MAX_IMAGES_PER_PRODUCT = 5;

// API Endpoints (for future backend integration)
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  USERS: '/api/users',
  AUTH: '/api/auth',
  REVIEWS: '/api/reviews',
  CATEGORIES: '/api/categories'
};

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/aruviah',
  TWITTER: 'https://twitter.com/aruviah',
  INSTAGRAM: 'https://instagram.com/aruviah',
  LINKEDIN: 'https://linkedin.com/company/aruviah'
};

// Contact Information
export const CONTACT_INFO = {
  EMAIL: 'support@aruviah.com',
  PHONE: '+254 700 000 000',
  ADDRESS: 'Nairobi, Kenya',
  SUPPORT_HOURS: 'Mon-Fri: 9:00 AM - 6:00 PM'
};

// Featured Sections
export const FEATURED_SECTIONS = {
  FLASH_DEALS: 'flash-deals',
  TOP_RATED: 'top-rated',
  NEW_ARRIVALS: 'new-arrivals',
  TRENDING: 'trending'
};

// Toast Notification Settings
export const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
};

// Local Storage Keys
export const STORAGE_KEYS = {
  CART: 'aruviah_cart',
  WISHLIST: 'aruviah_wishlist',
  USER: 'aruviah_user',
  THEME: 'aruviah_theme',
  RECENT_SEARCHES: 'aruviah_recent_searches'
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  AUTH: 'Authentication failed. Please login again.',
  NOT_FOUND: 'The requested item was not found.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  INVALID_INPUT: 'Please check your input and try again.',
  OUT_OF_STOCK: 'This item is currently out of stock.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  SIGNUP: 'Account created successfully!',
  LOGOUT: 'Successfully logged out!',
  ADD_TO_CART: 'Added to cart!',
  REMOVE_FROM_CART: 'Removed from cart!',
  ORDER_PLACED: 'Order placed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!'
};

// Regular Expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_KE: /^(\+254|0)[17]\d{8}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  POSTAL_CODE: /^\d{5}$/
};

// Kenya Counties
export const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kiambu', 'Nakuru', 'Kisumu',
  'Uasin Gishu', 'Kakamega', 'Machakos', 'Meru', 'Kilifi',
  'Bungoma', 'Kajiado', 'Nyeri', 'Laikipia', 'Murang\'a',
  'Embu', 'Kericho', 'Nyandarua', 'Kirinyaga', 'Bomet'
];

// Export all as default
const constants = {
  APP_NAME,
  APP_DESCRIPTION,
  CURRENCY,
  FREE_SHIPPING_THRESHOLD,
  ORDER_STATUS,
  PAYMENT_METHODS,
  CATEGORIES,
  CONTACT_INFO
};

export default constants;