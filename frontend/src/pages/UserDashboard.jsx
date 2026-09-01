import { useState, useEffect } from 'react';
import API from '../api/axios';

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Academic', priority: 'Medium' });
  const [editingId, setEditingId] = useState(null);

  const fetchComplaints = async () => {
    try {
      const res = await API.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/complaints/${editingId}`, formData);
        setEditingId(null);
      } else {
        await API.post('/complaints', formData);
      }
      setFormData({ title: '', description: '', category: 'Academic', priority: 'Medium' });
      fetchComplaints();
    } catch (err) {
      alert('Operation failed! Please try again.');
    }
  };

  const handleEdit = (c) => {
    setEditingId(c._id);
    setFormData({
      title: c.title,
      description: c.description,
      category: c.category || 'Academic',
      priority: c.priority || 'Medium'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await API.delete(`/complaints/${id}`);
        fetchComplaints();
      } catch (err) {
        alert('Delete action failed');
      }
    }
  };

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <h2>Student Complaint Portal</h2>
      </div>

      <div className="dashboard-grid">
        {/* CREATE / EDIT FORM CARD */}
        <div className="card">
          <h3>{editingId ? 'Edit Complaint' : 'Submit New Complaint'}</h3>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label>Complaint Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Projector issue in Room 302"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Detailed Description</label>
              <textarea
                className="form-control"
                placeholder="Describe your issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows="4"
              />
            </div>

            {/* Responsive Multi-column Row */}
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Academic">Academic</option>
                  <option value="Facilities">Facilities</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Administrative">Administrative</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority Level</label>
                <select
                  className="form-control"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="form-actions">
              {editingId && (
                <button
                  type="button"
                  className="btn-ui btn-outline"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ title: '', description: '', category: 'Academic', priority: 'Medium' });
                  }}
                >
                  Cancel
                </button>
              )}
              <button type="submit" className="btn-ui btn-primary">
                {editingId ? 'Update Complaint' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>

        {/* PERSONAL COMPLAINTS LIST */}
        <div className="card">
          <h3>My Submitted Complaints</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-table-msg">
                      No complaints submitted yet.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c._id}>
                      <td className="font-weight-600">{c.title}</td>
                      <td>{c.category || 'General'}</td>
                      <td>{c.priority || 'Medium'}</td>
                      <td>
                        <span className={`badge badge-${(c.status || 'pending').toLowerCase()}`}>
                          {c.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <button onClick={() => handleEdit(c)} className="btn-ui btn-outline btn-sm">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(c._id)} className="btn-ui btn-danger btn-sm">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;