const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

// Generate JWT token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Register new member
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, phone, department, role } = req.body;

        // Check if email already registered
        const existingMember = await Member.findOne({ email });
        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'This email is already registered'
            });
        }

        // Create member
        const member = await Member.create({
            fullName,
            email,
            password,
            phone,
            department,
            role: role || 'student'
        });

        const token = createToken(member._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            member: {
                id: member._id,
                fullName: member.fullName,
                email: member.email,
                role: member.role,
                department: member.department
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// Login member
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find member and include password for verification
        const member = await Member.findOne({ email }).select('+password');
        
        if (!member) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!member.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Contact admin.'
            });
        }

        // Verify password
        const isMatch = await member.checkPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = createToken(member._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            member: {
                id: member._id,
                fullName: member.fullName,
                email: member.email,
                role: member.role,
                department: member.department
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// Get current member profile
exports.getProfile = async (req, res) => {
    try {
        const member = await Member.findById(req.member._id);
        res.status(200).json({
            success: true,
            member: {
                id: member._id,
                fullName: member.fullName,
                email: member.email,
                phone: member.phone,
                department: member.department,
                role: member.role,
                createdAt: member.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, phone, department } = req.body;
        
        const member = await Member.findByIdAndUpdate(
            req.member._id,
            { fullName, phone, department },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated',
            member: {
                id: member._id,
                fullName: member.fullName,
                email: member.email,
                phone: member.phone,
                department: member.department,
                role: member.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Update failed',
            error: error.message
        });
    }
};

// Get all members (Admin)
exports.getAllMembers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        
        let query = {};
        
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const members = await Member.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Member.countDocuments(query);

        res.status(200).json({
            success: true,
            count: members.length,
            total,
            pages: Math.ceil(total / limit),
            members
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch members',
            error: error.message
        });
    }
};

// Update member role (Admin)
exports.updateMemberRole = async (req, res) => {
    try {
        const { role, isActive } = req.body;
        
        const member = await Member.findByIdAndUpdate(
            req.params.id,
            { role, isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Member updated',
            member
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Update failed',
            error: error.message
        });
    }
};
