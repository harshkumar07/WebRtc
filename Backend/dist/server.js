"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Enable CORS
app.use((0, cors_1.default)({
    origin: 'http://localhost:5174', // Your frontend URL, adjust if different
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:5174', // Frontend URL
        methods: ['GET', 'POST'],
    },
});
let users = 0; // Track number of connected users
let activeUsers = new Set(); // Set to track active users in a call
app.get('/', (req, res) => {
    res.send('WebRTC Signaling Server');
});
io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    users++;
    // Send a message to the frontend to notify about the user count
    io.emit('user-count', users); // Broadcast the number of connected users
    // Listen for offer, answer, and ice-candidate messages
    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer);
    });
    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });
    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });
    // Handle screen share start event
    socket.on('screen-share-started', (data) => {
        console.log('Screen sharing started by', socket.id);
        // Broadcast the screen share stream to other users
        socket.broadcast.emit('screen-share-started', { stream: data.stream });
        // Log the screen sharing event
        console.log(`Screen sharing started by user ${socket.id}`);
    });
    // Handle leave-call event (User manually ends the call)
    socket.on('leave-call', () => {
        console.log('user left the call');
        users--;
        activeUsers.delete(socket.id); // Remove from active users
        socket.broadcast.emit('user-disconnected', socket.id); // Emit user disconnection event
        io.emit('user-count', users); // Update user count
        // Log the number of active users
        console.log(`Currently, ${activeUsers.size} user(s) in the call.`);
        socket.disconnect(); // Disconnect the socket
    });
    // Handle user disconnection (automatic disconnect from the client)
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
        users--;
        activeUsers.delete(socket.id); // Remove from active users
        socket.broadcast.emit('user-disconnected', socket.id); // Emit user disconnection event
        io.emit('user-count', users); // Update user count
        // Log the number of active users
        console.log(`Currently, ${activeUsers.size} user(s) in the call.`);
    });
    // When a user joins the call (send a join signal)
    socket.on('join-call', () => {
        activeUsers.add(socket.id); // Add user to the active call
        console.log(`User joined the call. ${activeUsers.size} active user(s) in the call.`);
    });
});
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
