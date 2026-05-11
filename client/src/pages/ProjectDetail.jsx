import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate, statusLabels, getDeadlineRisk, getInitials } from '../utils/helpers';
import { PageLoader } from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineArrowLeft, HiOutlineCalendar } from 'react-icons/hi';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '', deadline: '' });
  const [saving, setSaving] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
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

  useEffect(() => { fetchProject(); fetchUsers(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) { toast.error('Task title is required'); return; }
    setSaving(true);
    try {
      await api.post('/tasks', { ...taskForm, project: id });
      toast.success('Task created');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '', deadline: '' });
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Status updated');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProject();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProject} />;
  if (!project) return null;

  const statusColumns = ['todo', 'in-progress', 'review', 'done'];
  const tasksByStatus = {};
  statusColumns.forEach(s => { tasksByStatus[s] = []; });
  project.tasks?.forEach(t => {
    if (tasksByStatus[t.status]) tasksByStatus[t.status].push(t);
    else tasksByStatus.todo.push(t);
  });

  return (
    <div className="fade-in">
      {/* header */}
      <div className="mb-6">
        <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{project.title}</h1>
            {project.description && <p className="text-sm text-slate-500 mt-1">{project.description}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full badge-${project.status}`}>{statusLabels[project.status]}</span>
              {project.deadline && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <HiOutlineCalendar className="w-3.5 h-3.5" /> Due {formatDate(project.deadline)}
                </span>
              )}
              <span className="text-xs text-slate-400">{project.tasks?.length || 0} tasks</span>
            </div>
          </div>
          {user?.role === 'admin' && (
            <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors self-start" id="add-task-btn">
              <HiOutlinePlus className="w-4 h-4" /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* task board */}
      {project.tasks?.length === 0 ? (
        <EmptyState type="tasks" title="No tasks yet" message="Add tasks to start tracking progress." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {statusColumns.map(status => (
            <div key={status} className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-semibold text-slate-700">{statusLabels[status]}</h3>
                <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{tasksByStatus[status].length}</span>
              </div>
              <div className="space-y-2">
                {tasksByStatus[status].map(task => {
                  const risk = getDeadlineRisk(task.deadline, task.status);
                  return (
                    <div key={task._id} className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition-shadow group cursor-pointer" onClick={() => setSelectedTask(task)}>
                      <p className="text-sm font-medium text-slate-800 mb-2">{task.title}</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded badge-${task.priority}`}>{task.priority}</span>
                        {risk && <span className={`text-xs font-medium ${risk.className}`}>{risk.label}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-[10px] text-primary-700 font-medium">{getInitials(task.assignedTo.name)}</span>
                            </div>
                            <span className="text-xs text-slate-500">{task.assignedTo.name?.split(' ')[0]}</span>
                          </div>
                        ) : <span className="text-xs text-slate-300">Unassigned</span>}
                        {task.deadline && <span className="text-xs text-slate-400">{formatDate(task.deadline)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* task detail modal */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task Details" size="md">
        {selectedTask && <TaskDetailView task={selectedTask} user={user} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} onClose={() => { setSelectedTask(null); fetchProject(); }} />}
      </Modal>

      {/* create task modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="New Task" size="md">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input type="text" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Task title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
              <select value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
            <input type="date" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create Task'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// task detail sub-component with comments
function TaskDetailView({ task, user, onStatusChange, onDelete, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/tasks/${task._id}/comments`);
        setComments(res.data);
      } catch (err) { /* ignore */ }
      finally { setLoadingComments(false); }
    };
    fetchComments();
  }, [task._id]);

  const postComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const res = await api.post(`/tasks/${task._id}/comments`, { text: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const risk = getDeadlineRisk(task.deadline, task.status);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800">{task.title}</h3>
        {task.description && <p className="text-sm text-slate-500 mt-1">{task.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-slate-400">Status</span>
          <div className="mt-1">
            <select value={task.status} onChange={(e) => onStatusChange(task._id, e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-white w-full">
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
        <div>
          <span className="text-slate-400">Priority</span>
          <p className={`mt-1 text-sm font-medium badge-${task.priority} inline-block px-2 py-1 rounded`}>{task.priority}</p>
        </div>
        <div>
          <span className="text-slate-400">Assigned to</span>
          <p className="mt-1 text-slate-700">{task.assignedTo?.name || 'Unassigned'}</p>
        </div>
        <div>
          <span className="text-slate-400">Deadline</span>
          <p className="mt-1">
            {task.deadline ? formatDate(task.deadline) : 'None'}
            {risk && <span className={`ml-2 text-xs font-medium ${risk.className}`}>{risk.label}</span>}
          </p>
        </div>
      </div>

      {user?.role === 'admin' && (
        <button onClick={() => { onDelete(task._id); onClose(); }} className="text-sm text-red-500 hover:text-red-700">Delete this task</button>
      )}

      {/* comments */}
      <div className="border-t border-slate-100 pt-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Comments ({comments.length})</h4>
        {loadingComments ? (
          <div className="skeleton h-4 w-32 mb-2"></div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-400 mb-3">No comments yet</p>
        ) : (
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {comments.map(c => (
              <div key={c._id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] text-slate-600 font-medium">{getInitials(c.user?.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700">{c.user?.name}</span>
                    <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={postComment} className="flex gap-2">
          <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..." className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          <button type="submit" disabled={posting || !newComment.trim()} className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">Post</button>
        </form>
      </div>
    </div>
  );
}
