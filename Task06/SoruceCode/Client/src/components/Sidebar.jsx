import { useState, useRef } from 'react';
import { uploadFile, downloadFile } from '../services/api';

export default function Sidebar({ 
    participants, 
    messages, 
    files, 
    onSendMessage, 
    roomId,
    onFileShared 
}) {
    const [activeTab, setActiveTab] = useState('chat');
    const [messageText, setMessageText] = useState('');
    const fileInputRef = useRef(null);

    const handleSend = () => {
        if (messageText.trim()) {
            onSendMessage(messageText);
            setMessageText('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await uploadFile(file, roomId);
            if (result.success) {
                onFileShared(result.file);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        }
        e.target.value = '';
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="sidebar">
            <div className="sidebar-tabs">
                <button 
                    className={`sidebar-tab ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    Chat
                </button>
                <button 
                    className={`sidebar-tab ${activeTab === 'people' ? 'active' : ''}`}
                    onClick={() => setActiveTab('people')}
                >
                    People ({participants.length})
                </button>
                <button 
                    className={`sidebar-tab ${activeTab === 'files' ? 'active' : ''}`}
                    onClick={() => setActiveTab('files')}
                >
                    Files
                </button>
            </div>

            <div className="sidebar-content">
                {activeTab === 'chat' && (
                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="empty-state">
                                <p>No messages yet</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="chat-msg">
                                    <div className="chat-msg-header">
                                        <span className="chat-msg-sender">{msg.sender}</span>
                                        <span className="chat-msg-time">{formatTime(msg.timestamp)}</span>
                                    </div>
                                    <p className="chat-msg-text">{msg.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'people' && (
                    <div className="participants-list">
                        {participants.map((p) => (
                            <div key={p.id} className="participant">
                                <div className="participant-avatar">
                                    {p.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <span className="participant-name">{p.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'files' && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />
                        <button 
                            className="file-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            + Upload file
                        </button>
                        <div className="files-list">
                            {files.length === 0 ? (
                                <div className="empty-state">
                                    <p>No files shared</p>
                                </div>
                            ) : (
                                files.map((file) => (
                                    <div key={file.id} className="file-item">
                                        <div className="file-icon">📄</div>
                                        <div className="file-info">
                                            <div className="file-name">{file.originalName}</div>
                                            <div className="file-meta">
                                                {formatSize(file.size)} • {file.sharedBy}
                                            </div>
                                        </div>
                                        <button 
                                            className="file-download"
                                            onClick={() => downloadFile(file.filename)}
                                        >
                                            ↓
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>

            {activeTab === 'chat' && (
                <div className="chat-input">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button onClick={handleSend}>Send</button>
                </div>
            )}
        </div>
    );
}
