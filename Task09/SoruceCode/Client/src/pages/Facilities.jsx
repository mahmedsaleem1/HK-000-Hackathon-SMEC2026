import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { facilityService } from '../services/api';
import FacilityCard from '../components/FacilityCard';
import { Search, Filter, X } from 'lucide-react';

const Facilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const categories = [
        { value: 'all', label: 'All Resources' },
        { value: 'lab', label: 'Laboratories' },
        { value: 'hall', label: 'Halls' },
        { value: 'meeting-room', label: 'Meeting Rooms' },
        { value: 'equipment', label: 'Equipment' },
        { value: 'sports', label: 'Sports' },
        { value: 'auditorium', label: 'Auditoriums' }
    ];

    useEffect(() => {
        fetchFacilities();
    }, [category, page]);

    const fetchFacilities = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 12 };
            if (category !== 'all') params.category = category;
            if (search) params.search = search;

            const data = await facilityService.getAll(params);
            setFacilities(data.facilities);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Failed to fetch facilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchFacilities();
    };

    const clearSearch = () => {
        setSearch('');
        setPage(1);
        fetchFacilities();
    };

    return (
        <div className="facilities-page">
            <div className="page-header">
                <h1>Campus Facilities</h1>
                <p>Find and book the perfect space for your needs</p>
            </div>

            <div className="filters-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-wrapper">
                        <Search size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search facilities..."
                        />
                        {search && (
                            <button type="button" className="clear-search" onClick={clearSearch}>
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button type="submit" className="btn-search">Search</button>
                </form>

                <div className="category-filters">
                    <Filter size={18} />
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            className={`filter-btn ${category === cat.value ? 'active' : ''}`}
                            onClick={() => { setCategory(cat.value); setPage(1); }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading-grid">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="skeleton-card"></div>
                    ))}
                </div>
            ) : facilities.length > 0 ? (
                <>
                    <div className="facilities-grid">
                        {facilities.map((facility) => (
                            <FacilityCard
                                key={facility._id}
                                facility={facility}
                                onClick={() => navigate(`/facilities/${facility._id}`)}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </button>
                            <span>Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <span className="empty-icon">🔍</span>
                    <h3>No facilities found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
};

export default Facilities;
