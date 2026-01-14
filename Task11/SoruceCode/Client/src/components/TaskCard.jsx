import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const TaskCard = ({ task }) => {
  const urgencyColors = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#dc2626'
  };

  return (
    <Link to={`/task/${task._id}`} className="task-card">
      <div className="task-card-header">
        <span 
          className="urgency-indicator" 
          style={{ backgroundColor: urgencyColors[task.urgency] }}
          title={task.urgency}
        />
        <span className="category-badge">{task.category}</span>
      </div>
      
      <h3 className="task-title">{task.title}</h3>
      
      <p className="task-description">
        {task.description.substring(0, 100)}...
      </p>
      
      <div className="task-skills">
        {task.skills.slice(0, 3).map((skill, i) => (
          <span key={i} className="skill-tag-small">{skill}</span>
        ))}
        {task.skills.length > 3 && <span className="more-skills">+{task.skills.length - 3}</span>}
      </div>
      
      <div className="task-footer">
        <div className="budget">
          <span className="budget-value">${task.budget.min} - ${task.budget.max}</span>
          <span className="budget-type">{task.budget.type}</span>
        </div>
        
        <div className="deadline">
          <span>📅 {format(new Date(task.deadline), 'MMM d')}</span>
        </div>
      </div>
      
      <div className="task-meta-bottom">
        <span className="poster">
          By {task.postedBy.name}
        </span>
        <span className="bids-count">
          {task.bids?.length || 0} bids
        </span>
      </div>
    </Link>
  );
};

export default TaskCard;
