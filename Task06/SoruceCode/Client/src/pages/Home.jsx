import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';

export default function Home() {
    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    const createRoom = () => {
        if (!name.trim()) return;
        socket.emit('create-room', ({ roomId }) => {
            navigate(`/room/${roomId}?name=${encodeURIComponent(name)}`);
        });
    };

    const joinRoom = () => {
        if (!name.trim() || !roomId.trim()) return;
        navigate(`/room/${roomId}?name=${encodeURIComponent(name)}`);
    };

    return (
        <div className="home">
            <div className="home-card">
                <h1>Collab</h1>
                <p>Video meetings made simple</p>

                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <button className="btn btn-primary" onClick={createRoom}>
                    Start new meeting
                </button>

                <div className="divider"><span>or join existing</span></div>

                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Enter room code"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                </div>

                <button className="btn btn-secondary" onClick={joinRoom}>
                    Join meeting
                </button>
            </div>
        </div>
    );
}
