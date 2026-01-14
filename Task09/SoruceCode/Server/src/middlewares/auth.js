const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

// Protect routes - verify token
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Please log in to access this resource'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.member = await Member.findById(decoded.id);
        
        if (!req.member) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Session expired. Please log in again'
        });
    }
};

// Admin only access
exports.adminOnly = (req, res, next) => {
    if (req.member.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required for this action'
        });
    }
    next();
};

// Staff and admin access
exports.staffAccess = (req, res, next) => {
    if (!['admin', 'staff', 'faculty'].includes(req.member.role)) {
        return res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
        });
    }
    next();
};

