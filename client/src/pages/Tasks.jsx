import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate, statusLabels, getDeadlineRisk, getInitials } from '../utils/helpers';
import { PageLoader } from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlineFilter, HiOutlineCalendar } from 'react-icons/hi';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [posting, setPosting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const res = await api.get('/tasks', { params });
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [filters]);

  const openTask = async (task) => {
    setSelectedTask(task);
    setLoadingComments(true);
    try {
      const res = await api.get(`/tasks/${task._id}/comments`);
      setComments(res.data);
    } catch (err) { setComments([]); }
    finally { setLoadingComments(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Status updated');
      fetchTasks();
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;
    setPosting(true);
    try {
      const res = await api.post(`/tasks/${selectedTask._id}/comments`, { text: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchTasks} />;

  return (
    <div className="fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {user?.role === 'admin' ? 'All Tasks' : 'My Tasks'}
          </h1>
          <p className="text-sm text-slate-500">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        {/* filters */}
        <div className="flex items-center gap-2">
          <HiOutlineFilter className="w-4 h-4 text-slate-400" />
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white">
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          <select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white">
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState type="tasks" title="No tasks found" message={filters.status || filters.priority ? 'Try changing the filters.' : user?.role === 'admin' ? 'Create tasks from the project page.' : 'No tasks have been assigned to you yet.'} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* table for desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Task</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Project</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Priority</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Assignee</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const risk = getDeadlineRisk(task.deadline, task.status);
                  return (
                    <tr key={task._id} className="border-b border-slate-50 hover:bg-slate-25 cursor-pointer transition-colors" onClick={() => openTask(task)}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-800">{task.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-500">{task.project?.title || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full badge-${task.status}`}>{statusLabels[task.status]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full badge-${task.priority}`}>{task.priority}</span>
                      </td>
                      <td className="px-4 py-3">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-[10px] text-primary-700 font-medium">{getInitials(task.assignedTo.name)}</span>
                            </div>
                            <span className="text-sm text-slate-600">{task.assignedTo.name}</span>
                          </div>
                        ) : <span className="text-sm text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">{task.deadline ? formatDate(task.deadline) : '—'}</span>
                          {risk && <span className={`text-xs font-medium ${risk.className}`}>{risk.label}</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* card layout for mobile */}
          <div className="md:hidden divide-y divide-slate-100">
            {tasks.map(task => {
              const risk = getDeadlineRisk(task.deadline, task.status);
              return (
                <div key={task._id} className="p-4 cursor-pointer hover:bg-slate-50" onClick={() => openTask(task)}>
                  <p className="text-sm font-medium text-slate-800 mb-1">{task.title}</p>
                  <p className="text-xs text-slate-400 mb-2">{task.project?.title}</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full badge-${task.status}`}>{statusLabels[task.status]}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full badge-${task.priority}`}>{task.priority}</span>
                    {risk && <span className={`text-xs font-medium ${risk.className}`}>{risk.label}</span>}
                    {task.assignedTo && <span className="text-xs text-slate-500">{task.assignedTo.name}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* task detail modal */}
      <Modal isOpen={!!selectedTask} onClose={() => { setSelectedTask(null); setComments([]); setNewComment(''); }} title="Task Details" size="md">
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{selectedTask.title}</h3>
              {selectedTask.description && <p className="text-sm text-slate-500 mt-1">{selectedTask.description}</p>}
              <p className="text-xs text-slate-400 mt-1">Project: {selectedTask.project?.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-400 text-xs">Status</span>
                <select value={selectedTask.status} onChange={(e) => handleStatusChange(selectedTask._id, e.target.value)} className="mt-1 w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-white">
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Priority</span>
                <p className={`mt-1 badge-${selectedTask.priority} inline-block px-2 py-1 rounded text-xs`}>{selectedTask.priority}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Assigned to</span>
                <p className="mt-1 text-slate-700">{selectedTask.assignedTo?.name || 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Deadline</span>
                <p className="mt-1 text-slate-700">{selectedTask.deadline ? formatDate(selectedTask.deadline) : 'None'}</p>
              </div>
            </div>

            {/* comments */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Comments</h4>
              {loadingComments ? (
                <div className="skeleton h-4 w-24"></div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-slate-400 mb-3">No comments yet</p>
              ) : (
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {comments.map(c => (
                    <div key={c._id} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] text-slate-600 font-medium">{getInitials(c.user?.name)}</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-slate-700">{c.user?.name}</span>
                        <p className="text-sm text-slate-600">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={postComment} className="flex gap-2">
                <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                <button type="submit" disabled={posting || !newComment.trim()} className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">Post</button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
