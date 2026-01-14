import { Beaker, Presentation, Wrench, Trophy, Users, Theater, HelpCircle } from 'lucide-react';

const categoryIcons = {
    lab: Beaker,
    hall: Presentation,
    equipment: Wrench,
    sports: Trophy,
    'meeting-room': Users,
    auditorium: Theater,
    other: HelpCircle
};

const categoryLabels = {
    lab: 'Laboratory',
    hall: 'Hall',
    equipment: 'Equipment',
    sports: 'Sports',
    'meeting-room': 'Meeting Room',
    auditorium: 'Auditorium',
    other: 'Other'
};

// High quality stock images from Unsplash for each category
const categoryImages = {
    lab: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
    hall: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    equipment: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
    sports: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    'meeting-room': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    auditorium: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    other: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop'
};

const FacilityCard = ({ facility, onClick }) => {
    const Icon = categoryIcons[facility.category] || HelpCircle;
    const defaultImage = categoryImages[facility.category] || categoryImages.other;
    const imageUrl = facility.imageUrl || defaultImage;
    
    return (
        <div className="facility-card" onClick={onClick}>
            <div className="facility-image">
                <img 
                    src={imageUrl} 
                    alt={facility.name}
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
                <div className="facility-placeholder" style={{ display: 'none' }}>
                    <Icon size={48} />
                </div>
                <span className="category-badge">{categoryLabels[facility.category]}</span>
            </div>
            <div className="facility-content">
                <h3 className="facility-name">{facility.name}</h3>
                {facility.location && (
                    <p className="facility-location">
                        {facility.location.building}
                        {facility.location.room && ` • Room ${facility.location.room}`}
                    </p>
                )}
                <p className="facility-desc">{facility.description?.substring(0, 80)}...</p>
                <div className="facility-meta">
                    <span className="capacity">
                        <Users size={14} />
                        {facility.capacity} capacity
                    </span>
                    {facility.requiresApproval && (
                        <span className="approval-tag">Needs Approval</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacilityCard;
export { categoryIcons, categoryLabels, categoryImages };
