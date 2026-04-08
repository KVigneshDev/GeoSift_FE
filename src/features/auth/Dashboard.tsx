import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { LogOut, User, Building2, Mail, Phone, Zap, Activity, Database } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GET_ME } from '@/apollo/operations';

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();

  // Fetch fresh user data
  const { data, loading, error, refetch } = useQuery(GET_ME, {
    fetchPolicy: 'cache-and-network',
  });

  const user = data?.me || authUser;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <p className="text-slate-400 mb-4">Failed to load user data</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg hover:bg-amber-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      {/* Background Effects */}
      <div
        className="fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
            </div>
            <span className="text-2xl font-bold text-slate-100 tracking-tight">
              Volt<span className="text-amber-500">Mind</span> AI
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="text-amber-500">{user?.name}</span>!
          </h1>
          <p className="text-slate-400">
            Here's your account overview and system status.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-slate-200 font-semibold">System Status</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">Online</p>
            <p className="text-xs text-slate-500 mt-1">All systems operational</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-slate-200 font-semibold">GraphQL Cache</h3>
            </div>
            <p className="text-2xl font-bold text-amber-400">Optimized</p>
            <p className="text-xs text-slate-500 mt-1">Fast data access</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-slate-200 font-semibold">Organization</h3>
            </div>
            <p className="text-2xl font-bold text-purple-400">Active</p>
            <p className="text-xs text-slate-500 mt-1">{user?.organization?.name}</p>
          </div>
        </div>

        {/* User Information Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">
                  Full Name
                </label>
                <p className="text-slate-200 font-medium">{user?.name}</p>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">
                  Email Address
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <p className="text-slate-200">{user?.email}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">
                  Phone Number
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <p className="text-slate-200">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">
                  Organization
                </label>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <p className="text-slate-200">{user?.organization?.name}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">
                  Organization ID
                </label>
                <p className="text-slate-200 font-mono text-sm">{user?.organization?.id}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Connected via Apollo Client • GraphQL API Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
