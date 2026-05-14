import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initSocket } from './sockets/socket.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import captainRoutes from './routes/captain.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import aiRoutes from './routes/ai.js';

// Middleware
import errorHandler from './middleware/error.middleware.js';

const app = express();
const httpServer = createServer(app);

// Initializing Socket.io
initSocket(httpServer);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mounting Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/captain', captainRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: "FixBuddy Backend is healthy" });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
