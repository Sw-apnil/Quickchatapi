# 🚀 QuickChat Server

**QuickChat Server** is a scalable backend API and real-time server built with **Node.js** and **Express**, designed to power a modern chat application. It handles authentication, real-time messaging, media uploads, and user presence using **Socket.io** and **MongoDB**.

---

## 🧩 Project Overview

- **Name:** QuickChat Server  
- **Type:** Backend API & Real-time Server  
- **Runtime:** Node.js  
- **Architecture:** REST + WebSockets  

---

## 🛠️ Tech Stack

### Core
- **Node.js**
- **Express.js**

### Database
- **MongoDB** (via Mongoose)

### Real-time Communication
- **Socket.io**

### Authentication & Security
- **JWT (JSON Web Tokens)**
- **BcryptJS** – password hashing

### Media & File Storage
- **Cloudinary**

### Utilities
- **Dotenv**
- **CORS**

---

## 📂 Project Structure

```text
├── server.js            # Main entry point (Express, Socket.io, DB connection)
├── lib/
│   └── db.js            # MongoDB connection logic
├── models/              # Mongoose schemas (User, Message, etc.)
├── routes/              # API route definitions
│   ├── userRoutes.js    # Auth & user-related endpoints
│   └── messageRoutes.js # Chat message endpoints
├── controllers/         # Route request handlers
├── middleware/          # Custom middleware (auth, error handling)
├── package.json         # Dependencies & scripts
└── .env                 # Environment variables
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root and add:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=3000
NODE_ENV=development
```

---

## 📜 Scripts

```bash
npm start       # Run server using node (production)
npm run server  # Run server using nodemon (development)
```

---

## ✨ Key Features

* 🔐 Secure authentication with JWT and hashed passwords
* 💬 Real-time messaging using Socket.io
* 🖼 Media and image upload support via Cloudinary
* 🌐 RESTful API for users and messages
* 🟢 Real-time online/offline user presence
* 🧱 Scalable and modular backend architecture

---

## 📌 Prerequisites

* Node.js **v18+**
* npm or pnpm
* MongoDB (local or cloud)
* Cloudinary account

---

## 🚀 Getting Started

```bash
git clone <repository-url>
cd quickchat-server
npm install
npm run server
```

Server will start on:

```text
http://localhost:3000
```

---

## 🚧 Future Enhancements

* Group chat support
* Message read receipts
* Typing indicators
* Push notifications
* Rate limiting & advanced security
* Admin/moderation tools

---

## 📄 License

This project is intended for learning and development purposes.
You may add an open-source license (MIT, Apache 2.0, etc.) if required.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.
Fork the repository and submit a pull request.

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
