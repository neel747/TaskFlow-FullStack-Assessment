import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate, statusLabels, getDeadlineRisk } from '../utils/helpers';
import { PageLoader, SkeletonList } from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCalendar } from 'react-icons/hi';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'planning', priority: 'medium', members: [], deadline: '' });
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (user?.role !== 'admin') return;
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) { /* ignore */ }
  };

  useEffect(() => { fetchProjects(); fetchUsers(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData({ title: '', description: '', status: 'planning', priority: 'medium', members: [], deadline: '' });
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      members: project.members?.map(m => m._id) || [],
      deadline: project.deadline ? project.deadline.slice(0, 10) : ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/projects/${editing._id}`, formData);
        toast.success('Project updated');
      } else {
        await api.post('/projects', formData);
        toast.success('Project created');
      }
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  if (loading) return <SkeletonList count={6} />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProjects} />;

  const priorityColors = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Projects</h1>
          <p className="text-sm text-slate-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors" id="create-project-btn">
            <HiOutlinePlus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState type="projects" title="No projects yet" message={user?.role === 'admin' ? 'Create your first project to get started.' : 'You haven\'t been added to any projects yet.'}
          action={user?.role === 'admin' && <button onClick={openCreate} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Create Project</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => {
            const risk = getDeadlineRisk(project.deadline, project.status === 'completed' ? 'done' : '');
            return (
              <div key={project._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <Link to={`/projects/${project._id}`} className="text-base font-semibold text-slate-800 hover:text-primary-600 transition-colors line-clamp-1">
                    {project.title}
                  </Link>
                  {user?.role === 'admin' && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(project)} className="p-1 rounded hover:bg-slate-100"><HiOutlinePencil className="w-4 h-4 text-slate-400" /></button>
                      <button onClick={() => handleDelete(project._id)} className="p-1 rounded hover:bg-red-50"><HiOutlineTrash className="w-4 h-4 text-red-400" /></button>
                    </div>
                  )}
                </div>
                {project.description && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{project.description}</p>}

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full badge-${project.status}`}>{statusLabels[project.status]}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[project.priority]}`}>{project.priority}</span>
                </div>

                {/* task progress bar */}
                {project.taskCounts && project.taskCounts.total > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{project.taskCounts.done}/{project.taskCounts.total} tasks done</span>
                      <span>{Math.round((project.taskCounts.done / project.taskCounts.total) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(project.taskCounts.done / project.taskCounts.total) * 100}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <HiOutlineCalendar className="w-3.5 h-3.5" />
                    {project.deadline ? formatDate(project.deadline) : 'No deadline'}
                  </div>
                  {risk && <span className={`font-medium ${risk.className}`}>{risk.label}</span>}
                  <span>{project.members?.length || 0} members</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* create/edit modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Project' : 'New Project'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Project name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" placeholder="Brief description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
            <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          {users.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Members</label>
              <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                {users.map(u => (
                  <label key={u._id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" checked={formData.members.includes(u._id)} onChange={() => toggleMember(u._id)} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-slate-700">{u.name}</span>
                    <span className="text-xs text-slate-400">{u.email}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
