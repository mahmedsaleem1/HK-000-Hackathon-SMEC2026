const mongoose = require('mongoose');
const Member = require('../models/Member');
const Facility = require('../models/Facility');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connected for seeding...');

        // Clear existing data
        await Member.deleteMany({});
        await Facility.deleteMany({});

        // Create admin user
        const admin = await Member.create({
            fullName: 'System Admin',
            email: 'admin@campushub.edu',
            password: 'admin123',
            phone: '1234567890',
            department: 'Administration',
            role: 'admin'
        });

        console.log('Admin created:', admin.email);

        // Create sample facilities
        const facilities = [
            {
                name: 'Computer Lab A',
                category: 'lab',
                description: 'Modern computer lab with 40 workstations, projector, and high-speed internet.',
                location: { building: 'Tech Block', floor: '2nd', room: '201' },
                capacity: 40,
                amenities: ['Projector', 'Whiteboard', 'AC', 'Wi-Fi'],
                availability: {
                    monday: { start: '08:00', end: '18:00', available: true },
                    tuesday: { start: '08:00', end: '18:00', available: true },
                    wednesday: { start: '08:00', end: '18:00', available: true },
                    thursday: { start: '08:00', end: '18:00', available: true },
                    friday: { start: '08:00', end: '16:00', available: true },
                    saturday: { start: '09:00', end: '13:00', available: true },
                    sunday: { start: '', end: '', available: false }
                },
                tags: ['computers', 'programming', 'lab'],
                managedBy: admin._id
            },
            {
                name: 'Seminar Hall',
                category: 'hall',
                description: 'Large seminar hall suitable for presentations, workshops, and events.',
                location: { building: 'Main Block', floor: 'Ground', room: 'G-01' },
                capacity: 150,
                amenities: ['Projector', 'Sound System', 'Podium', 'AC', 'Stage'],
                availability: {
                    monday: { start: '09:00', end: '20:00', available: true },
                    tuesday: { start: '09:00', end: '20:00', available: true },
                    wednesday: { start: '09:00', end: '20:00', available: true },
                    thursday: { start: '09:00', end: '20:00', available: true },
                    friday: { start: '09:00', end: '18:00', available: true },
                    saturday: { start: '09:00', end: '14:00', available: true },
                    sunday: { start: '', end: '', available: false }
                },
                tags: ['seminar', 'presentation', 'events'],
                managedBy: admin._id
            },
            {
                name: 'Physics Lab',
                category: 'lab',
                description: 'Well-equipped physics laboratory for experiments and practicals.',
                location: { building: 'Science Block', floor: '1st', room: '102' },
                capacity: 30,
                amenities: ['Lab Equipment', 'Safety Gear', 'Workbenches'],
                availability: {
                    monday: { start: '09:00', end: '17:00', available: true },
                    tuesday: { start: '09:00', end: '17:00', available: true },
                    wednesday: { start: '09:00', end: '17:00', available: true },
                    thursday: { start: '09:00', end: '17:00', available: true },
                    friday: { start: '09:00', end: '15:00', available: true },
                    saturday: { start: '', end: '', available: false },
                    sunday: { start: '', end: '', available: false }
                },
                tags: ['physics', 'science', 'experiments'],
                managedBy: admin._id
            },
            {
                name: 'Conference Room B',
                category: 'meeting-room',
                description: 'Executive conference room for meetings and discussions.',
                location: { building: 'Admin Block', floor: '3rd', room: '305' },
                capacity: 20,
                amenities: ['Smart TV', 'Video Conferencing', 'Whiteboard', 'AC'],
                availability: {
                    monday: { start: '08:00', end: '18:00', available: true },
                    tuesday: { start: '08:00', end: '18:00', available: true },
                    wednesday: { start: '08:00', end: '18:00', available: true },
                    thursday: { start: '08:00', end: '18:00', available: true },
                    friday: { start: '08:00', end: '18:00', available: true },
                    saturday: { start: '', end: '', available: false },
                    sunday: { start: '', end: '', available: false }
                },
                requiresApproval: true,
                tags: ['meeting', 'conference', 'discussion'],
                managedBy: admin._id
            },
            {
                name: 'Sports Equipment Store',
                category: 'equipment',
                description: 'Sports equipment available for borrowing - balls, rackets, nets, etc.',
                location: { building: 'Sports Complex', floor: 'Ground', room: 'Store' },
                capacity: 50,
                amenities: ['Footballs', 'Badminton Sets', 'Cricket Kits', 'Volleyballs'],
                availability: {
                    monday: { start: '06:00', end: '20:00', available: true },
                    tuesday: { start: '06:00', end: '20:00', available: true },
                    wednesday: { start: '06:00', end: '20:00', available: true },
                    thursday: { start: '06:00', end: '20:00', available: true },
                    friday: { start: '06:00', end: '20:00', available: true },
                    saturday: { start: '06:00', end: '18:00', available: true },
                    sunday: { start: '07:00', end: '12:00', available: true }
                },
                requiresApproval: false,
                tags: ['sports', 'equipment', 'games'],
                managedBy: admin._id
            },
            {
                name: 'Main Auditorium',
                category: 'auditorium',
                description: 'Grand auditorium for cultural events, annual functions, and large gatherings.',
                location: { building: 'Cultural Center', floor: 'Ground', room: 'Main Hall' },
                capacity: 500,
                amenities: ['Stage', 'Professional Sound', 'Lighting', 'Green Rooms', 'AC'],
                availability: {
                    monday: { start: '10:00', end: '21:00', available: true },
                    tuesday: { start: '10:00', end: '21:00', available: true },
                    wednesday: { start: '10:00', end: '21:00', available: true },
                    thursday: { start: '10:00', end: '21:00', available: true },
                    friday: { start: '10:00', end: '21:00', available: true },
                    saturday: { start: '09:00', end: '22:00', available: true },
                    sunday: { start: '09:00', end: '18:00', available: true }
                },
                requiresApproval: true,
                defaultSlotDuration: 120,
                tags: ['auditorium', 'events', 'cultural'],
                managedBy: admin._id
            },
            {
                name: 'Indoor Badminton Court',
                category: 'sports',
                description: 'Professional indoor badminton court with wooden flooring.',
                location: { building: 'Sports Complex', floor: 'Ground', room: 'Court 1' },
                capacity: 4,
                amenities: ['Wooden Flooring', 'Lighting', 'Nets'],
                availability: {
                    monday: { start: '06:00', end: '21:00', available: true },
                    tuesday: { start: '06:00', end: '21:00', available: true },
                    wednesday: { start: '06:00', end: '21:00', available: true },
                    thursday: { start: '06:00', end: '21:00', available: true },
                    friday: { start: '06:00', end: '21:00', available: true },
                    saturday: { start: '06:00', end: '20:00', available: true },
                    sunday: { start: '07:00', end: '18:00', available: true }
                },
                requiresApproval: false,
                defaultSlotDuration: 60,
                tags: ['badminton', 'sports', 'indoor'],
                managedBy: admin._id
            },
            {
                name: 'Electronics Lab',
                category: 'lab',
                description: 'Electronics and embedded systems lab with oscilloscopes and soldering stations.',
                location: { building: 'Tech Block', floor: '1st', room: '105' },
                capacity: 25,
                amenities: ['Oscilloscopes', 'Function Generators', 'Soldering Stations', 'Components'],
                availability: {
                    monday: { start: '09:00', end: '17:00', available: true },
                    tuesday: { start: '09:00', end: '17:00', available: true },
                    wednesday: { start: '09:00', end: '17:00', available: true },
                    thursday: { start: '09:00', end: '17:00', available: true },
                    friday: { start: '09:00', end: '15:00', available: true },
                    saturday: { start: '', end: '', available: false },
                    sunday: { start: '', end: '', available: false }
                },
                tags: ['electronics', 'embedded', 'circuits'],
                managedBy: admin._id
            }
        ];

        await Facility.insertMany(facilities);
        console.log(`${facilities.length} facilities created`);

        // Create sample users
        const users = [
            {
                fullName: 'Rahul Sharma',
                email: 'rahul@student.edu',
                password: 'password123',
                phone: '9876543210',
                department: 'Computer Science',
                role: 'student'
            },
            {
                fullName: 'Dr. Priya Patel',
                email: 'priya@faculty.edu',
                password: 'password123',
                phone: '9876543211',
                department: 'Physics',
                role: 'faculty'
            },
            {
                fullName: 'Amit Kumar',
                email: 'amit@staff.edu',
                password: 'password123',
                phone: '9876543212',
                department: 'Sports',
                role: 'staff'
            }
        ];

        await Member.insertMany(users);
        console.log(`${users.length} sample users created`);

        console.log('\n=== Seed Complete ===');
        console.log('Admin Login: admin@campushub.edu / admin123');
        console.log('Student Login: rahul@student.edu / password123');
        
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error.message);
        process.exit(1);
    }
};

seedData();
