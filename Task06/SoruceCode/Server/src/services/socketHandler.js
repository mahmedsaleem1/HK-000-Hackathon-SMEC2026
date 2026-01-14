const { v4: uuidv4 } = require('uuid');

const rooms = new Map();
const whiteboards = new Map();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('create-room', (callback) => {
            const roomId = uuidv4().slice(0, 8);
            rooms.set(roomId, {
                id: roomId,
                participants: [],
                createdAt: Date.now()
            });
            whiteboards.set(roomId, []);
            callback({ roomId });
        });

        socket.on('join-room', ({ roomId, userName }) => {
            let room = rooms.get(roomId);
            
            if (!room) {
                room = {
                    id: roomId,
                    participants: [],
                    createdAt: Date.now()
                };
                rooms.set(roomId, room);
                whiteboards.set(roomId, []);
            }

            const existingIdx = room.participants.findIndex(p => p.id === socket.id);
            if (existingIdx !== -1) {
                room.participants.splice(existingIdx, 1);
            }

            const participant = {
                id: socket.id,
                name: userName,
                joinedAt: Date.now()
            };

            room.participants.push(participant);
            socket.join(roomId);
            socket.roomId = roomId;
            socket.userName = userName;

            socket.to(roomId).emit('user-joined', {
                peerId: socket.id,
                userName
            });

            const otherUsers = room.participants
                .filter(p => p.id !== socket.id)
                .map(p => ({ peerId: p.id, userName: p.name }));

            socket.emit('existing-users', otherUsers);
            socket.emit('whiteboard-state', whiteboards.get(roomId) || []);

            io.to(roomId).emit('participants-updated', room.participants);
        });

        socket.on('signal', ({ to, signal }) => {
            io.to(to).emit('signal', {
                from: socket.id,
                signal,
                userName: socket.userName
            });
        });

        socket.on('toggle-audio', ({ roomId, enabled }) => {
            socket.to(roomId).emit('user-toggle-audio', {
                peerId: socket.id,
                enabled
            });
        });

        socket.on('toggle-video', ({ roomId, enabled }) => {
            socket.to(roomId).emit('user-toggle-video', {
                peerId: socket.id,
                enabled
            });
        });

        socket.on('screen-share-started', ({ roomId }) => {
            socket.to(roomId).emit('user-screen-share-started', {
                peerId: socket.id,
                userName: socket.userName
            });
        });

        socket.on('screen-share-stopped', ({ roomId }) => {
            socket.to(roomId).emit('user-screen-share-stopped', {
                peerId: socket.id
            });
        });

        socket.on('whiteboard-draw', ({ roomId, data }) => {
            const board = whiteboards.get(roomId);
            if (board) {
                board.push(data);
            }
            socket.to(roomId).emit('whiteboard-draw', data);
        });

        socket.on('whiteboard-clear', ({ roomId }) => {
            whiteboards.set(roomId, []);
            socket.to(roomId).emit('whiteboard-clear');
        });

        socket.on('chat-message', ({ roomId, message }) => {
            io.to(roomId).emit('chat-message', {
                id: uuidv4(),
                sender: socket.userName,
                senderId: socket.id,
                message,
                timestamp: Date.now()
            });
        });

        socket.on('leave-room', ({ roomId }) => {
            const room = rooms.get(roomId);
            if (room) {
                room.participants = room.participants.filter(p => p.id !== socket.id);
                
                socket.to(roomId).emit('user-left', {
                    peerId: socket.id,
                    userName: socket.userName
                });

                io.to(roomId).emit('participants-updated', room.participants);
                socket.leave(roomId);
                
                if (room.participants.length === 0) {
                    rooms.delete(roomId);
                    whiteboards.delete(roomId);
                }
            }
        });

        socket.on('file-shared', ({ roomId, file }) => {
            io.to(roomId).emit('file-shared', {
                ...file,
                sharedBy: socket.userName,
                sharedAt: Date.now()
            });
        });

        socket.on('disconnect', () => {
            const roomId = socket.roomId;
            if (roomId) {
                const room = rooms.get(roomId);
                if (room) {
                    room.participants = room.participants.filter(p => p.id !== socket.id);
                    
                    socket.to(roomId).emit('user-left', {
                        peerId: socket.id,
                        userName: socket.userName
                    });

                    io.to(roomId).emit('participants-updated', room.participants);

                    if (room.participants.length === 0) {
                        rooms.delete(roomId);
                        whiteboards.delete(roomId);
                    }
                }
            }
            console.log('User disconnected:', socket.id);
        });
    });
};
