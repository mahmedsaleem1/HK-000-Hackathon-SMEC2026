const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Design',
  'Writing',
  'Data Entry',
  'Tutoring',
  'Marketing',
  'Video Editing',
  'Photography',
  'Other'
];

const TaskFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="task-filters">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="search-input"
        />
      </div>

      <div className="filter-group">
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="filter-group">
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ sortBy: e.target.value })}
        >
          <option value="">Sort By: Latest</option>
          <option value="budget">Highest Budget</option>
          <option value="deadline">Earliest Deadline</option>
          <option value="urgency">Urgency</option>
        </select>
      </div>
    </div>
  );
};

export default TaskFilters;
