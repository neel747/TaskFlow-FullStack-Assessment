import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // basic validation
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">TF</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create an account</h1>
          <p className="text-slate-500 text-sm mt-1">Get started with TaskFlow</p>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1.5">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="user">Team Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            id="register-submit"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
