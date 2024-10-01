import { dirname } from 'path'; // Node.js 的 path 模塊
import { fileURLToPath } from 'url'; // url 模塊，用於解析當前文件的路徑

// 手動構造 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

// 將 public 文件夾設為靜態資源目錄
app.use(express.static('public'));

// 設置根路徑返回 index.html 作為首頁
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // 返回 index.html 文件
});

// 如果需要，可以設置專門的路徑來訪問 optimal_index.html（例如 /optimal）
app.get('/optimal', (req, res) => {
    res.sendFile(__dirname + '/public/optimal_index.html'); // 返回 optimal_index.html 文件
});

// 配置 Socket.IO 的事件處理
io.on('connect', socket => {
    console.log(`${socket.id} connected.`);

    socket.on('create-room', (roomId) => {
        if (io.sockets.adapter.rooms.get(roomId)) {
            console.log(`${socket.id} create a room with id ${roomId} but failed because room id has been taken`);
            socket.emit('create-room-failed', 'room id has been taken');
            return;
        }

        console.log(`${socket.id} create a room with id ${roomId}`);
        socket.join(roomId);
        socket.emit('room-joined', roomId);
    });

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.emit('room-joined', roomId);
        io.to(roomId).emit('user-joined-room', roomId, socket.id);
    });

    socket.on('send-message', (roomId, message) => {
        io.to(roomId).emit('receive-message', roomId, socket.id, message);
    });
});

// 啟動伺服器並監聽 3000 端口
server.listen(3000, () => {
    console.log('listening on *:3000');
});
