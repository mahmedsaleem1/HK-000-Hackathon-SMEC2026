const path = require('path');
const fs = require('fs');

const uploadedFiles = new Map();

exports.uploadFile = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { roomId } = req.body;
        const fileData = {
            id: Date.now().toString(),
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            roomId,
            uploadedAt: Date.now()
        };

        if (!uploadedFiles.has(roomId)) {
            uploadedFiles.set(roomId, []);
        }
        uploadedFiles.get(roomId).push(fileData);

        res.json({
            success: true,
            file: fileData,
            url: `/uploads/${req.file.filename}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
};

exports.downloadFile = (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../../uploads', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.download(filePath);
    } catch (error) {
        res.status(500).json({ error: 'Download failed' });
    }
};

exports.getRoomFiles = (req, res) => {
    try {
        const { roomId } = req.params;
        const files = uploadedFiles.get(roomId) || [];
        res.json({ files });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get files' });
    }
};
