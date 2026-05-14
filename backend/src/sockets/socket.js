import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        }
    });

    console.log('Socket.io initialized');

    io.on('connection', (socket) => {
        console.log(`New socket connection: ${socket.id}`);

        socket.on('register', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their private room.`);
        });

        socket.on('join_request_room', (requestId) => {
            socket.join(requestId);
            console.log(`Socket ${socket.id} joined request room: ${requestId}`);
        });

        socket.on('send_message', (payload) => {
            const { serviceRequestId, text, senderId, receiverId } = payload;
            io.to(serviceRequestId).emit('receive_message', {
                serviceRequestId,
                text,
                senderId,
                createdAt: new Date()
            });
            io.to(receiverId).emit('new_notification', {
                type: 'MESSAGE',
                message: `New message: ${text.substring(0, 20)}...`,
                serviceRequestId
            });
        });

        socket.on('update_location', (data) => {
            const { captainId, latitude, longitude } = data;
            io.emit('captain_location_update', { captainId, latitude, longitude });
        });

        socket.on('update_user_location', (data) => {
            const { userId, serviceRequestId, latitude, longitude } = data;
            // Broadcast user location to the specific request room
            io.to(serviceRequestId).emit('user_location_update', { serviceRequestId, userId, latitude, longitude });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
