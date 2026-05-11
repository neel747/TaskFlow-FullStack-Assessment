import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getDeadlineRisk, timeAgo, statusLabels } from '../utils/helpers';
import { PageLoader } from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import {
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineUsers,
  HiOutlineTrendingUp,
  HiOutlineClock,
} from 'react-icons/hi';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStats} />;
  if (!stats) return null;

  const cards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: HiOutlineFolder, bg: 'bg-blue-100', clr: 'text-blue-600' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: HiOutlineClipboardList, bg: 'bg-purple-100', clr: 'text-purple-600' },
    { label: 'Completed', value: stats.tasksByStatus.done, icon: HiOutlineCheckCircle, bg: 'bg-green-100', clr: 'text-green-600' },
    { label: 'Overdue', value: stats.overdueTasks, icon: HiOutlineExclamation, bg: stats.overdueTasks > 0 ? 'bg-red-100' : 'bg-slate-100', clr: stats.overdueTasks > 0 ? 'text-red-600' : 'text-slate-600' },
  ];

  if (user?.role === 'admin') {
    cards.push({ label: 'Team Members', value: stats.teamCount, icon: HiOutlineUsers, bg: 'bg-teal-100', clr: 'text-teal-600' });
  }

  const barColors = { todo: 'bg-slate-300', 'in-progress': 'bg-blue-500', review: 'bg-amber-500', done: 'bg-green-500' };

  return (
    <div className="space-y-6 fade-in">
      {/* summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">{c.label}</span>
              <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
                <c.icon className={`w-5 h-5 ${c.clr}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* task status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Task Overview</h2>
          <div className="space-y-3">
            {Object.entries(stats.tasksByStatus).map(([status, count]) => {
              const pct = stats.totalTasks ? Math.round((count / stats.totalTasks) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{statusLabels[status]}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColors[status]} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-sm text-slate-500">Completion: </span>
            <span className="text-sm font-semibold text-primary-600">{stats.completionRate}%</span>
          </div>
        </div>

        {/* deadline risks */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineClock className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-800">Deadline Risks</h2>
          </div>
          {stats.atRiskTasks?.length > 0 ? (
            <div className="space-y-2">
              {stats.atRiskTasks.map((task) => {
                const risk = getDeadlineRisk(task.deadline, task.status);
                return (
                  <div key={task._id} className="flex items-start justify-between gap-2 py-2 border-b border-slate-50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                      <p className="text-xs text-slate-400">{task.project?.title}</p>
                    </div>
                    {risk && <span className={`text-xs font-medium whitespace-nowrap ${risk.className}`}>{risk.label}</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-4 text-center">No deadline risks right now</p>
          )}
        </div>

        {/* recent activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Recent Activity</h2>
          {stats.recentTasks?.length > 0 ? (
            <div className="space-y-2">
              {stats.recentTasks.map((task) => (
                <div key={task._id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${task.status === 'done' ? 'bg-green-500' : task.status === 'in-progress' ? 'bg-blue-500' : task.status === 'review' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded badge-${task.status}`}>{statusLabels[task.status]}</span>
                      <span className="text-xs text-slate-400">{timeAgo(task.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-4 text-center">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
