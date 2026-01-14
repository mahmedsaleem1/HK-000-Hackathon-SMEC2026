import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI } from '../config/api';
import toast from 'react-hot-toast';

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

const CreateTask = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: '',
    budgetMin: '',
    budgetMax: '',
    budgetType: 'fixed',
    deadline: '',
    urgency: 'medium'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        budget: {
          min: Number(formData.budgetMin),
          max: Number(formData.budgetMax),
          type: formData.budgetType
        },
        deadline: formData.deadline,
        urgency: formData.urgency
      };

      await tasksAPI.create(taskData);
      toast.success('Task created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-task-page">
      <h1>Post a New Task</h1>
      <p>Get help from talented students</p>

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">Task Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            minLength={5}
            placeholder="e.g., Build a React landing page"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            minLength={20}
            rows={5}
            placeholder="Describe your task in detail..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="urgency">Urgency</label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="skills">Required Skills (comma separated)</label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g., React, CSS, Node.js"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="budgetMin">Min Budget ($)</label>
            <input
              type="number"
              id="budgetMin"
              name="budgetMin"
              value={formData.budgetMin}
              onChange={handleChange}
              required
              min={0}
              placeholder="50"
            />
          </div>

          <div className="form-group">
            <label htmlFor="budgetMax">Max Budget ($)</label>
            <input
              type="number"
              id="budgetMax"
              name="budgetMax"
              value={formData.budgetMax}
              onChange={handleChange}
              required
              min={0}
              placeholder="200"
            />
          </div>

          <div className="form-group">
            <label htmlFor="budgetType">Budget Type</label>
            <select
              id="budgetType"
              name="budgetType"
              value={formData.budgetType}
              onChange={handleChange}
            >
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="deadline">Deadline</label>
          <input
            type="datetime-local"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Post Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
