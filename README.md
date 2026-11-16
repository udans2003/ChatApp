# ChatWave – Real-Time Chat Application

ChatWave is a full-stack real-time messaging application developed using the MERN stack and Socket.IO. It provides a modern and interactive platform where users can communicate through public and private conversations with instant message delivery.

The application includes secure user authentication, real-time messaging, online presence tracking, typing indicators, message management, and a responsive user interface.

## Features

### User Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing using bcrypt
- Protected API endpoints
- User logout functionality

### Real-Time Messaging
- Public group chat
- Private one-to-one conversations
- Instant message delivery using Socket.IO
- Persistent message history stored in MongoDB
- Automatic message updates without refreshing the page

### Message Management
- Edit sent messages
- Delete sent messages
- Display edited message indicators
- Read receipts and message delivery status
- Message timestamps
- Unread message counts

### User Presence and Interaction
- Online and offline status indicators
- Real-time typing indicators
- Active user tracking
- Recent message previews
- Conversation sorting based on recent activity

### User Profile Management
- View user profile information
- Update username
- Profile management interface

### User Interface
- Modern chat interface
- Separate public and private chat sections
- Sender and receiver message alignment
- User avatars
- Interactive message actions
- Clean and user-friendly design

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-Time Communication | Socket.IO |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| API Communication | REST API, Fetch API |
| Version Control | Git, GitHub |

## Project Structure

```text
ChatWave/
│
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── user.js
│   │   ├── message.js
│   │   ├── conversation.js
│   │   └── privateMessage.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── conversationRoutes.js
│   │   └── profileRoutes.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Auth.jsx
│   │   ├── services/
│   │   │   ├── chatApi.js
│   │   │   └── profileApi.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── profilePanel.jsx
│   │   ├── profilePanel.css
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

## Installation and Setup

### Prerequisites

Ensure that the following software is installed:

- Node.js and npm
- MongoDB (local installation or MongoDB Atlas)
- Git
- A code editor such as Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ChatApp.git
cd chatApp
```

Replace `YOUR_USERNAME` with your GitHub username and adjust the repository name if necessary.

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and configure the required environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Use the exact variable names expected by your backend configuration.

Start the backend server:

```bash
npm run dev
```

If your backend does not define a `dev` script, use:

```bash
node server.js
```

The backend runs at:

`http://localhost:5000`

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Open the URL displayed by Vite, typically:

`http://localhost:5173`

## How to Use ChatWave

1. Register a new account or log in with existing credentials.
2. Access the main ChatWave messaging dashboard.
3. Select **General Chat** to communicate in the public chat room.
4. Select a registered user from the sidebar to start a private conversation.
5. Send and receive messages instantly.
6. View online status, typing indicators, and read receipts.
7. Edit or delete your own private messages using the message action menu.
8. Open the profile panel to view or update your username.
9. Log out when finished.

## Security

ChatWave implements several security mechanisms:

- Password hashing using bcrypt
- JWT-based authentication
- Protected backend routes
- Authentication for Socket.IO connections
- Authorization checks for private conversations
- Sender-based permission checks for editing and deleting messages
- Environment variables for sensitive configuration

**Note:** Never commit your `.env` file, MongoDB credentials, or JWT secret to GitHub.

## Future Enhancements

- Group chat creation and management
- Image and file sharing
- Emoji picker and message reactions
- Voice and video calling
- Browser notifications
- Message search
- Dark mode
- Improved mobile responsiveness

## Author

Developed as a full-stack web development project to explore real-time communication, secure authentication, REST APIs, and modern frontend development.

## License

License information has not yet been specified.
