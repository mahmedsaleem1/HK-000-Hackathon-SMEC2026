import { useEffect, useRef } from 'react';

export default function VideoTile({ 
    stream, 
    userName, 
    isLocal = false, 
    audioEnabled = true, 
    videoEnabled = true,
    isScreenShare = false 
}) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            console.log('VideoTile: attached stream for', userName, 'tracks:', stream.getTracks().length);
        }
    }, [stream, userName]);

    const showVideo = stream && (isLocal ? videoEnabled : true);

    return (
        <div className={`video-tile ${isLocal && !isScreenShare ? 'local' : ''}`}>
            {stream && (
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted={isLocal}
                    style={{ display: showVideo ? 'block' : 'none' }}
                />
            )}
            
            {!showVideo && (
                <div className="no-video">
                    <div className="no-video-icon">
                        {userName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                </div>
            )}

            {isScreenShare && <span className="screen-share-badge">Screen</span>}

            <span className="video-name">{userName}{stream ? '' : ' (connecting...)'}</span>

            {isLocal && (
                <div className="video-status">
                    {!audioEnabled && <span className="status-icon off">🔇</span>}
                    {!videoEnabled && <span className="status-icon off">📷</span>}
                </div>
            )}
        </div>
    );
}
