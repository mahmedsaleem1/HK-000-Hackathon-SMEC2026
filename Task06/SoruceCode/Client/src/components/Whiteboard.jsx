import { useRef, useEffect, useState } from 'react';

const COLORS = ['#000000', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'];

export default function Whiteboard({ data, onDraw, onClear }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [tool, setTool] = useState('pen');
    const lastPoint = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        data.forEach(drawStroke);
    }, []);

    useEffect(() => {
        if (data.length > 0) {
            const lastStroke = data[data.length - 1];
            drawStroke(lastStroke);
        }
    }, [data]);

    const drawStroke = (stroke) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (stroke.tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.beginPath();
        ctx.moveTo(stroke.x1, stroke.y1);
        ctx.lineTo(stroke.x2, stroke.y2);
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
    };

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (e.touches) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        lastPoint.current = getPos(e);
    };

    const draw = (e) => {
        if (!isDrawing || !lastPoint.current) return;

        const pos = getPos(e);
        const stroke = {
            x1: lastPoint.current.x,
            y1: lastPoint.current.y,
            x2: pos.x,
            y2: pos.y,
            color: tool === 'eraser' ? '#ffffff' : color,
            width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
            tool
        };

        drawStroke(stroke);
        onDraw(stroke);
        lastPoint.current = pos;
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        lastPoint.current = null;
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        onClear();
    };

    return (
        <div className="whiteboard-container">
            <div className="whiteboard-toolbar">
                <button 
                    className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
                    onClick={() => setTool('pen')}
                    title="Pen"
                >
                    ✏️
                </button>
                <button 
                    className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                    onClick={() => setTool('eraser')}
                    title="Eraser"
                >
                    🧹
                </button>

                <div className="color-picker">
                    {COLORS.map((c) => (
                        <button
                            key={c}
                            className={`color-btn ${color === c ? 'active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>

                <div className="stroke-size">
                    <span style={{ color: '#888', fontSize: '12px' }}>Size:</span>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    />
                </div>

                <button className="tool-btn" onClick={handleClear} title="Clear">
                    🗑️
                </button>
            </div>

            <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className="whiteboard-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        </div>
    );
}
