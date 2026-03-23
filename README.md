# EpicBloggy

EpicBloggy is a fully-featured, modern blogging platform built with the MERN (MongoDB, Express, React, Node.js) stack. It comes with rich text, image upload/optimization, a robust admin dashboard, and AI-powered content generation using Google Gemini API.

## 🚀 Features

### For Users:
- **Rich Text Blogging:** Create, read, and manage articles effortlessly.
- **AI Content Generator:** Automatically generate high-quality blog posts using Google's Gemini API integrated right into the editor.
- **Image Optimization:** Integrated with ImageKit for automatic image compression, caching, and serving.
- **Comments System:** Engage with posts by adding comments (pending admin approval).
- **User Dashboard:** Track your published and pending blogs.

### For Admins:
- **Interactive Dashboard:** In-depth aggregated stats showing total and pending blogs, comments, etc.
- **Manage Content:** Approve or reject user blogs and comments to maintain quality.
- **Manage Blogs:** A powerful and dedicated editor interface to seamlessly update or delete any blog.
- **Role-Based Access Control:** Secure JWT authentication to ensure admin capabilities are locked out from standard users.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- React Router DOM
- Quill (Rich Text Editor)
- Axios & React Hot Toast

**Backend:**
- Node.js & Express
- MongoDB (Mongoose)
- Google Gemini API
- ImageKit API
- JSONWebToken (JWT) & Bcryptjs
- Nodemailer

## 🔧 Prerequisites

Make sure you have the following installed on your machine:
- Node.js (v18 or higher recommended)
- MongoDB Database

## 💻 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/EpicBloggy.git
   cd EpicBloggy
   ```

2. **Setup the Backend (Server):**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file inside the `/server` directory and add the following variables:
   ```env
   # JWT Configuration
   JWT_SECRET="your_jwt_secret"

   # SMTP Email Configuration (Nodemailer)
   SMTP_USER="your_email@gmail.com"
   SMTP_PASS="your_app_password"

   # Admin Credentials
   ADMIN_EMAIL="admin_email@example.com"
   ADMIN_PASSWORD="secure_admin_password"

   # MongoDB
   MONGODB_URI="your_mongodb_connection_string"

   # ImageKit configuration
   IMAGEKIT_PUBLIC_KEY="your_imagekit_public_key"
   IMAGEKIT_PRIVATE_KEY="your_imagekit_private_key"
   IMAGEKIT_URL_ENDPOINT="your_imagekit_url_endpoint"

   # Gemini API Key (For AI generation)
   GEMINI_API_KEY="your_gemini_api_key"
   ```

3. **Setup the Frontend (Client):**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file inside the `/client` directory and add the following variable:
   ```env
   VITE_BASE_URL="http://localhost:5000" # Or your server's backend port
   ```

## 🏃‍♂️ Running the app

You'll need to run both the frontend and backend servers. 

1. **Start the backend server:**
   ```bash
   cd server
   npm run server
   ```

2. **Start the frontend client:**
   ```bash
   cd client
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` to see the app in action!

## 📁 Folder Structure

```
EpicBloggy/
├── client/              # React Frontend (Vite)
│   ├── public/          # Static assets
│   ├── src/             # Source files (Components, Context, Pages, Assets)
│   └── package.json     
└── server/              # Node.js + Express Backend
    ├── config/          # Configurations (ImageKit, Gemini API, Mongoose)
    ├── controllers/     # Route logic
    ├── middleware/      # Auth & Upload Middlewares
    ├── models/          # MongoDB Schemas
    ├── routes/          # API endpoint routes
    └── server.js        # Entry point
```

## 📄 License
This project is open-source and free to be duplicated and modified for personal use.