import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';
import VideoTile from '../components/VideoTile';
import Sidebar from '../components/Sidebar';
import Controls from '../components/Controls';
import Whiteboard from '../components/Whiteboard';
import Peer from 'simple-peer';

export default function Room() {
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const userName = searchParams.get('name') || 'Guest';

    const [peers, setPeers] = useState([]);
    const [stream, setStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [files, setFiles] = useState([]);
    const [whiteboardData, setWhiteboardData] = useState([]);

    const peersRef = useRef([]);
    const streamRef = useRef(null);

    useEffect(() => {
        const createPeer = (peerId, peerName, initiator, incomingSignal = null) => {
            const existing = peersRef.current.find(p => p.peerId === peerId);
            if (existing) {
                if (incomingSignal) {
                    try { existing.peer.signal(incomingSignal); } catch(e) {}
                }
                return existing.peer;
            }

            console.log('Creating peer for:', peerName, 'initiator:', initiator, 'hasStream:', !!streamRef.current);

            const peer = new Peer({
                initiator,
                trickle: true,
                stream: streamRef.current || undefined,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                }
            });

            peer.on('signal', signal => {
                socket.emit('signal', { to: peerId, signal });
            });

            peer.on('stream', remoteStream => {
                console.log('Got stream from:', peerId, 'tracks:', remoteStream.getTracks().length);
                setPeers(prev => {
                    const idx = prev.findIndex(p => p.peerId === peerId);
                    if (idx >= 0) {
                        const updated = [...prev];
                        updated[idx] = { ...updated[idx], stream: remoteStream };
                        return updated;
                    }
                    return prev;
                });
            });

            peer.on('connect', () => console.log('Connected to:', peerId));
            peer.on('error', e => console.log('Peer error:', e.message));

            peersRef.current.push({ peerId, peer, userName: peerName });
            setPeers(prev => [...prev, { peerId, userName: peerName, stream: null }]);

            if (incomingSignal) {
                try { peer.signal(incomingSignal); } catch(e) {}
            }

            return peer;
        };

        const init = async () => {
            try {
                const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(localStream);
                streamRef.current = localStream;
                console.log('Got local stream, tracks:', localStream.getTracks().length);
            } catch (e) {
                console.log('No camera/mic access');
            }

            socket.emit('join-room', { roomId, userName });
        };

        socket.on('existing-users', users => {
            console.log('Existing users:', users.length);
            users.forEach(({ peerId, userName: pName }) => {
                createPeer(peerId, pName, true);
            });
        });

        socket.on('user-joined', ({ peerId, userName: pName }) => {
            console.log('User joined:', pName);
            // Don't create peer here - wait for their signal
        });

        socket.on('signal', ({ from, signal, userName: pName }) => {
            console.log('Signal from:', from);
            const existing = peersRef.current.find(p => p.peerId === from);
            if (existing) {
                try { existing.peer.signal(signal); } catch(e) {}
            } else {
                createPeer(from, pName, false, signal);
            }
        });

        socket.on('user-left', ({ peerId }) => {
            const item = peersRef.current.find(p => p.peerId === peerId);
            if (item) {
                try { item.peer.destroy(); } catch(e) {}
            }
            peersRef.current = peersRef.current.filter(p => p.peerId !== peerId);
            setPeers(prev => prev.filter(p => p.peerId !== peerId));
        });

        socket.on('participants-updated', setParticipants);
        socket.on('chat-message', msg => setMessages(prev => [...prev, msg]));
        socket.on('file-shared', file => setFiles(prev => [...prev, file]));
        socket.on('whiteboard-state', setWhiteboardData);
        socket.on('whiteboard-draw', data => setWhiteboardData(prev => [...prev, data]));
        socket.on('whiteboard-clear', () => setWhiteboardData([]));
        socket.on('room-error', ({ message }) => { alert(message); navigate('/'); });
        
        socket.on('user-toggle-audio', ({ peerId, enabled }) => {
            setPeers(prev => prev.map(p => 
                p.peerId === peerId ? { ...p, audioEnabled: enabled } : p
            ));
        });
        
        socket.on('user-toggle-video', ({ peerId, enabled }) => {
            setPeers(prev => prev.map(p => 
                p.peerId === peerId ? { ...p, videoEnabled: enabled } : p
            ));
        });
        
        socket.on('user-screen-share-started', ({ peerId, userName: pName }) => {
            setPeers(prev => prev.map(p => 
                p.peerId === peerId ? { ...p, isScreenSharing: true } : p
            ));
        });
        
        socket.on('user-screen-share-stopped', ({ peerId }) => {
            setPeers(prev => prev.map(p => 
                p.peerId === peerId ? { ...p, isScreenSharing: false } : p
            ));
        });

        init();

        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
            peersRef.current.forEach(p => { try { p.peer.destroy(); } catch(e) {} });
            socket.off('existing-users');
            socket.off('user-joined');
            socket.off('signal');
            socket.off('user-left');
            socket.off('user-toggle-audio');
            socket.off('user-toggle-video');
            socket.off('user-screen-share-started');
            socket.off('user-screen-share-stopped');
            socket.off('participants-updated');
            socket.off('chat-message');
            socket.off('file-shared');
            socket.off('whiteboard-state');
            socket.off('whiteboard-draw');
            socket.off('whiteboard-clear');
            socket.off('room-error');
        };
    }, [roomId, userName, navigate]);

    const toggleAudio = () => {
        const currentStream = streamRef.current;
        if (currentStream) {
            const tracks = currentStream.getAudioTracks();
            if (tracks.length > 0) {
                const newState = !audioEnabled;
                // Disable on local stream
                tracks.forEach(track => {
                    track.enabled = newState;
                });
                // Also update in peer connections
                peersRef.current.forEach(({ peer }) => {
                    const sender = peer._pc?.getSenders().find(s => s.track?.kind === 'audio');
                    if (sender && sender.track) {
                        sender.track.enabled = newState;
                    }
                });
                setAudioEnabled(newState);
                socket.emit('toggle-audio', { roomId, enabled: newState });
                console.log('Audio toggled to:', newState);
            }
        }
    };

    const toggleVideo = () => {
        const currentStream = streamRef.current;
        if (currentStream) {
            const tracks = currentStream.getVideoTracks();
            if (tracks.length > 0) {
                const newState = !videoEnabled;
                // Disable on local stream
                tracks.forEach(track => {
                    track.enabled = newState;
                });
                // Also update in peer connections
                peersRef.current.forEach(({ peer }) => {
                    const sender = peer._pc?.getSenders().find(s => s.track?.kind === 'video');
                    if (sender && sender.track) {
                        sender.track.enabled = newState;
                    }
                });
                setVideoEnabled(newState);
                socket.emit('toggle-video', { roomId, enabled: newState });
                console.log('Video toggled to:', newState);
            }
        }
    };

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            // Stop screen share and restore camera
            screenStream?.getTracks().forEach(t => t.stop());
            setScreenStream(null);
            setIsScreenSharing(false);
            
            // Replace screen track with camera track in all peers
            const cameraTrack = streamRef.current?.getVideoTracks()[0];
            if (cameraTrack) {
                peersRef.current.forEach(({ peer }) => {
                    const sender = peer._pc?.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(cameraTrack);
                    }
                });
            }
            socket.emit('screen-share-stopped', { roomId });
        } else {
            try {
                const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
                setScreenStream(screen);
                setIsScreenSharing(true);
                
                // Replace camera track with screen track in all peers
                const screenTrack = screen.getVideoTracks()[0];
                peersRef.current.forEach(({ peer }) => {
                    const sender = peer._pc?.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                });
                
                socket.emit('screen-share-started', { roomId, oderId: socket.id });
                
                screenTrack.onended = () => {
                    setScreenStream(null);
                    setIsScreenSharing(false);
                    // Restore camera track
                    const cameraTrack = streamRef.current?.getVideoTracks()[0];
                    if (cameraTrack) {
                        peersRef.current.forEach(({ peer }) => {
                            const sender = peer._pc?.getSenders().find(s => s.track?.kind === 'video');
                            if (sender) {
                                sender.replaceTrack(cameraTrack);
                            }
                        });
                    }
                    socket.emit('screen-share-stopped', { roomId });
                };
            } catch (e) {
                console.log('Screen share cancelled');
            }
        }
    };

    const leaveRoom = () => {
        socket.emit('leave-room', { roomId });
        streamRef.current?.getTracks().forEach(t => t.stop());
        screenStream?.getTracks().forEach(t => t.stop());
        peersRef.current.forEach(p => { try { p.peer.destroy(); } catch(e) {} });
        navigate('/');
    };

    return (
        <div className="room-container">
            <header className="room-header">
                <div>
                    <h2>Meeting</h2>
                    <span className="room-id">Code: {roomId}</span>
                </div>
            </header>

            <div className="room-main">
                {showWhiteboard ? (
                    <Whiteboard
                        data={whiteboardData}
                        onDraw={data => socket.emit('whiteboard-draw', { roomId, data })}
                        onClear={() => socket.emit('whiteboard-clear', { roomId })}
                    />
                ) : (
                    <div className="video-area">
                        <div className="video-grid">
                            <VideoTile
                                stream={isScreenSharing ? screenStream : stream}
                                userName={userName + ' (You)'}
                                isLocal
                                audioEnabled={audioEnabled}
                                videoEnabled={videoEnabled}
                                isScreenShare={isScreenSharing}
                            />
                            {peers.map(p => (
                                <VideoTile
                                    key={p.peerId}
                                    stream={p.stream}
                                    userName={p.userName}
                                    isScreenShare={p.isScreenSharing}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <Sidebar
                    participants={participants}
                    messages={messages}
                    files={files}
                    onSendMessage={text => socket.emit('chat-message', { roomId, message: text })}
                    roomId={roomId}
                    onFileShared={file => socket.emit('file-shared', { roomId, file })}
                />
            </div>

            <Controls
                audioEnabled={audioEnabled}
                videoEnabled={videoEnabled}
                isScreenSharing={isScreenSharing}
                showWhiteboard={showWhiteboard}
                onToggleAudio={toggleAudio}
                onToggleVideo={toggleVideo}
                onToggleScreenShare={toggleScreenShare}
                onToggleWhiteboard={() => setShowWhiteboard(!showWhiteboard)}
                onLeave={leaveRoom}
            />
        </div>
    );
}
