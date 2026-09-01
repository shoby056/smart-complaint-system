import { useState, useEffect } from 'react';
import API from '../api/axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      const usersRes = await API.get('/admin/pending-users');
      const compRes = await API.get('/complaints');
      setUsers(usersRes.data);
      setComplaints(compRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalComplaints = complaints.length;
  const pendingApprovals = users.filter((u) => u.status === 'PENDING').length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED').length;
  const inProgressComplaints = complaints.filter((c) => c.status === 'IN_PROGRESS').length;

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleUserStatus = async (userId, status) => {
    await API.put(`/admin/users/${userId}/status`, { status });
    fetchData();
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    await API.put(`/admin/users/${userId}/role`, { role: newRole });
    fetchData();
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Delete "${userName}" and all associated complaints permanently?`)) {
      await API.delete(`/admin/users/${userId}`);
      fetchData();
    }
  };

  const handleComplaintStatus = async (id, status) => {
    await API.put(`/complaints/${id}/status`, { status });
    fetchData();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Admin Management Dashboard</h2>

      {/* STATS MONITORING CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
          <h4 style={{ margin: 0, color: '#64748b' }}>Pending Users</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0 0' }}>{pendingApprovals}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h4 style={{ margin: 0, color: '#64748b' }}>Total Complaints</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0 0' }}>{totalComplaints}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <h4 style={{ margin: 0, color: '#64748b' }}>Resolved</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0 0' }}>{resolvedComplaints}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
          <h4 style={{ margin: 0, color: '#64748b' }}>In Progress</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0 0' }}>{inProgressComplaints}</p>
        </div>
      </div>

      {/* MANAGE REGISTERED USERS DIRECTORY (PERMANENT LIST) */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3>Registered Users Directory</h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <strong>{u.role}</strong>
                    <button onClick={() => handleRoleToggle(u._id, u.role)} className="btn-ui btn-outline" style={{ marginLeft: '8px' }}>
                      Change
                    </button>
                  </td>
                  <td><span className={`badge badge-${u.status.toLowerCase()}`}>{u.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {u.status !== 'ACTIVE' && (
                        <button onClick={() => handleUserStatus(u._id, 'ACTIVE')} className="btn-ui btn-approve">
                          Approve
                        </button>
                      )}
                      {u.status !== 'DEACTIVATED' && (
                        <button onClick={() => handleUserStatus(u._id, 'DEACTIVATED')} className="btn-ui btn-reject">
                          Deactivate
                        </button>
                      )}
                      <button onClick={() => handleDeleteUser(u._id, u.name)} className="btn-ui btn-danger">
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPLAINTS MANAGEMENT */}
      <div className="card">
        <h3>Complaints Lifecycle Management</h3>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search by student or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', flex: '1', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((c) => (
                <tr key={c._id}>
                  <td>{c.user?.name || 'User'}</td>
                  <td>{c.title}</td>
                  <td>{c.category || 'General'}</td>
                  <td>
                    <span style={{ fontWeight: '600', color: c.priority === 'High' ? '#ef4444' : c.priority === 'Medium' ? '#f59e0b' : '#10b981' }}>
                      {c.priority || 'Medium'}
                    </span>
                  </td>
                  <td><span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleComplaintStatus(c._id, 'IN_PROGRESS')} className="btn-ui btn-primary">
                        In Progress
                      </button>
                      <button onClick={() => handleComplaintStatus(c._id, 'RESOLVED')} className="btn-ui btn-approve">
                        Resolve
                      </button>
                      <button onClick={() => handleComplaintStatus(c._id, 'REJECTED')} className="btn-ui btn-danger">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;