import { useState, useEffect } from 'react';
import { reservationService, facilityService, memberService } from '../services/api';
import toast from 'react-hot-toast';
import { 
    Building2, Calendar, Users, Clock, CheckCircle, XCircle, 
    AlertCircle, Plus, Edit, Trash2, Eye, Search, Filter
} from 'lucide-react';
import { categoryLabels } from '../components/FacilityCard';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [facilityStats, setFacilityStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [showFacilityModal, setShowFacilityModal] = useState(false);
    const [editingFacility, setEditingFacility] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab, statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview' || activeTab === 'bookings') {
                const [statsData, bookingsData] = await Promise.all([
                    reservationService.getStats(),
                    reservationService.getAll({ status: statusFilter !== 'all' ? statusFilter : undefined })
                ]);
                setStats(statsData.stats);
                setBookings(bookingsData.reservations);
            }
            if (activeTab === 'overview' || activeTab === 'facilities') {
                const [facStatsData, facData] = await Promise.all([
                    facilityService.getStats(),
                    facilityService.getAdminList({})
                ]);
                setFacilityStats(facStatsData.stats);
                setFacilities(facData.facilities);
            }
            if (activeTab === 'members') {
                const membersData = await memberService.getAll({});
                setMembers(membersData.members);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status, remarks = '') => {
        setProcessingId(id);
        try {
            await reservationService.updateStatus(id, status, remarks);
            toast.success(`Booking ${status}`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteFacility = async (id) => {
        if (!confirm('Are you sure you want to delete this facility?')) return;
        
        try {
            await facilityService.delete(id);
            toast.success('Facility deleted');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Eye },
        { id: 'bookings', label: 'Bookings', icon: Calendar },
        { id: 'facilities', label: 'Facilities', icon: Building2 },
        { id: 'members', label: 'Members', icon: Users }
    ];

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Manage campus resources and bookings</p>
            </div>

            <div className="admin-tabs">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="admin-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon pending">
                                    <AlertCircle size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats?.pendingApproval || 0}</span>
                                    <span className="stat-label">Pending Approval</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon success">
                                    <CheckCircle size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats?.todayBookings || 0}</span>
                                    <span className="stat-label">Today's Bookings</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon info">
                                    <Calendar size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{stats?.upcomingThisWeek || 0}</span>
                                    <span className="stat-label">This Week</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon primary">
                                    <Building2 size={24} />
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{facilityStats?.active || 0}</span>
                                    <span className="stat-label">Active Facilities</span>
                                </div>
                            </div>
                        </div>

                        <div className="quick-section">
                            <h3>Pending Approvals</h3>
                            {bookings.filter(b => b.status === 'pending').slice(0, 5).map((booking) => (
                                <div key={booking._id} className="quick-item">
                                    <div className="quick-info">
                                        <strong>{booking.title}</strong>
                                        <span>{booking.facility?.name} • {formatDate(booking.date)} • {booking.startTime}</span>
                                        <span className="requester">By: {booking.requestedBy?.fullName}</span>
                                    </div>
                                    <div className="quick-actions">
                                        <button
                                            className="btn-approve"
                                            onClick={() => handleStatusUpdate(booking._id, 'approved')}
                                            disabled={processingId === booking._id}
                                        >
                                            <CheckCircle size={16} />
                                        </button>
                                        <button
                                            className="btn-decline"
                                            onClick={() => {
                                                const remarks = prompt('Reason for declining (optional):');
                                                handleStatusUpdate(booking._id, 'declined', remarks || '');
                                            }}
                                            disabled={processingId === booking._id}
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {bookings.filter(b => b.status === 'pending').length === 0 && (
                                <p className="no-items">No pending bookings</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div className="bookings-section">
                        <div className="section-header">
                            <h3>All Bookings</h3>
                            <div className="filter-group">
                                <Filter size={16} />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="declined">Declined</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Booking</th>
                                        <th>Facility</th>
                                        <th>Date & Time</th>
                                        <th>Requested By</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking._id}>
                                            <td>
                                                <strong>{booking.title}</strong>
                                                {booking.purpose && <small>{booking.purpose}</small>}
                                            </td>
                                            <td>{booking.facility?.name}</td>
                                            <td>
                                                {formatDate(booking.date)}<br />
                                                <small>{booking.startTime} - {booking.endTime}</small>
                                            </td>
                                            <td>
                                                {booking.requestedBy?.fullName}<br />
                                                <small>{booking.requestedBy?.email}</small>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${booking.status}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td>
                                                {booking.status === 'pending' && (
                                                    <div className="action-btns">
                                                        <button
                                                            className="btn-sm approve"
                                                            onClick={() => handleStatusUpdate(booking._id, 'approved')}
                                                            disabled={processingId === booking._id}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn-sm decline"
                                                            onClick={() => {
                                                                const remarks = prompt('Reason:');
                                                                handleStatusUpdate(booking._id, 'declined', remarks || '');
                                                            }}
                                                            disabled={processingId === booking._id}
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Facilities Tab */}
                {activeTab === 'facilities' && (
                    <div className="facilities-section">
                        <div className="section-header">
                            <h3>Manage Facilities</h3>
                            <button
                                className="btn-add"
                                onClick={() => {
                                    setEditingFacility(null);
                                    setShowFacilityModal(true);
                                }}
                            >
                                <Plus size={18} />
                                Add Facility
                            </button>
                        </div>

                        <div className="facilities-admin-grid">
                            {facilities.map((facility) => (
                                <div key={facility._id} className="facility-admin-card">
                                    <div className="fac-header">
                                        <span className={`status-dot ${facility.isActive ? 'active' : 'inactive'}`}></span>
                                        <span className="category-label">{categoryLabels[facility.category]}</span>
                                    </div>
                                    <h4>{facility.name}</h4>
                                    <p>{facility.location?.building} • Capacity: {facility.capacity}</p>
                                    <div className="fac-actions">
                                        <button
                                            className="btn-icon"
                                            onClick={() => {
                                                setEditingFacility(facility);
                                                setShowFacilityModal(true);
                                            }}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="btn-icon danger"
                                            onClick={() => handleDeleteFacility(facility._id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                    <div className="members-section">
                        <div className="section-header">
                            <h3>Registered Members</h3>
                        </div>

                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Department</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member) => (
                                        <tr key={member._id}>
                                            <td>{member.fullName}</td>
                                            <td>{member.email}</td>
                                            <td>{member.department || '-'}</td>
                                            <td>
                                                <span className={`role-badge ${member.role}`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${member.isActive ? 'active' : 'inactive'}`}>
                                                    {member.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Facility Modal */}
            {showFacilityModal && (
                <FacilityModal
                    facility={editingFacility}
                    onClose={() => setShowFacilityModal(false)}
                    onSave={() => {
                        setShowFacilityModal(false);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
};

// Facility Create/Edit Modal
const FacilityModal = ({ facility, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: facility?.name || '',
        category: facility?.category || 'lab',
        description: facility?.description || '',
        building: facility?.location?.building || '',
        floor: facility?.location?.floor || '',
        room: facility?.location?.room || '',
        capacity: facility?.capacity || 20,
        amenities: facility?.amenities?.join(', ') || '',
        defaultSlotDuration: facility?.defaultSlotDuration || 60,
        requiresApproval: facility?.requiresApproval ?? true,
        isActive: facility?.isActive ?? true
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = {
                name: formData.name,
                category: formData.category,
                description: formData.description,
                location: {
                    building: formData.building,
                    floor: formData.floor,
                    room: formData.room
                },
                capacity: parseInt(formData.capacity),
                amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
                defaultSlotDuration: parseInt(formData.defaultSlotDuration),
                requiresApproval: formData.requiresApproval,
                isActive: formData.isActive
            };

            if (facility) {
                await facilityService.update(facility._id, data);
                toast.success('Facility updated');
            } else {
                await facilityService.create(data);
                toast.success('Facility created');
            }
            onSave();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{facility ? 'Edit Facility' : 'Add New Facility'}</h2>
                
                <form onSubmit={handleSubmit} className="facility-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Facility Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="lab">Laboratory</option>
                                <option value="hall">Hall</option>
                                <option value="meeting-room">Meeting Room</option>
                                <option value="equipment">Equipment</option>
                                <option value="sports">Sports</option>
                                <option value="auditorium">Auditorium</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Building</label>
                            <input
                                type="text"
                                value={formData.building}
                                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Floor</label>
                            <input
                                type="text"
                                value={formData.floor}
                                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Room</label>
                            <input
                                type="text"
                                value={formData.room}
                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Capacity</label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                min={1}
                            />
                        </div>
                        <div className="form-group">
                            <label>Slot Duration (minutes)</label>
                            <input
                                type="number"
                                value={formData.defaultSlotDuration}
                                onChange={(e) => setFormData({ ...formData, defaultSlotDuration: e.target.value })}
                                min={15}
                                step={15}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Amenities (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.amenities}
                            onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                            placeholder="e.g., Projector, Whiteboard, AC"
                        />
                    </div>

                    <div className="form-row checkboxes">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.requiresApproval}
                                onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                            />
                            Requires Admin Approval
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            Active (visible to users)
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? 'Saving...' : facility ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
