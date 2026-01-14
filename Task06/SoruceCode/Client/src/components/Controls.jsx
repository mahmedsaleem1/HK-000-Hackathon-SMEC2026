export default function Controls({
    audioEnabled,
    videoEnabled,
    isScreenSharing,
    showWhiteboard,
    onToggleAudio,
    onToggleVideo,
    onToggleScreenShare,
    onToggleWhiteboard,
    onLeave
}) {
    return (
        <div className="controls">
            <button 
                className={`control-btn ${audioEnabled ? '' : 'active'}`}
                onClick={onToggleAudio}
                title={audioEnabled ? 'Mute' : 'Unmute'}
            >
                {audioEnabled ? '🎤' : '🔇'}
            </button>

            <button 
                className={`control-btn ${videoEnabled ? '' : 'active'}`}
                onClick={onToggleVideo}
                title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
                {videoEnabled ? '📹' : '📷'}
            </button>

            <button 
                className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                onClick={onToggleScreenShare}
                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
                🖥️
            </button>

            <button 
                className={`control-btn ${showWhiteboard ? 'active' : ''}`}
                onClick={onToggleWhiteboard}
                title={showWhiteboard ? 'Hide whiteboard' : 'Show whiteboard'}
            >
                ✏️
            </button>

            <button 
                className="control-btn danger"
                onClick={onLeave}
                title="Leave meeting"
            >
                📞
            </button>
        </div>
    );
}
