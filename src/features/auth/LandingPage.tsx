import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, Lock, User, Building2, Phone, CheckCircle2,
  MapPin, ArrowRight, Layers, Sparkles, Zap
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import InputField from '@/features/auth/components/InputField';
import type { UserFormData, FormErrors } from '@/features/auth/types';

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();

  const [isLoginView, setIsLoginView] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organization: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/map';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!isLoginView) {
      if (!userData.name.trim()) e.name = 'Name is required';
      if (!userData.phone.trim()) e.phone = 'Phone is required';
      if (!userData.organization.trim()) e.organization = 'Organization is required';
      if (userData.password !== userData.confirmPassword) e.confirmPassword = "Passwords don't match";
    }
    if (!userData.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(userData.email)) e.email = 'Invalid email format';
    if (!userData.password) e.password = 'Password is required';
    else if (!isLoginView && userData.password.length < 4) e.password = 'Password must be at least 4 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await login(userData.email, userData.password);
      navigate('/map');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(userData, "userData")

  const handleRegister = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        organization: userData.organization,
      });
      setIsLoginView(true);
      setUserData({
        name: '',
        email: userData.email,
        password: '',
        confirmPassword: '',
        phone: '',
        organization: '',
      });
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-teal-50/20 to-orange-50/20 relative overflow-hidden">
      {/* Floating geometric shapes */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      {/* Diagonal accent lines */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(15, 118, 110, 0.1) 50px, rgba(15, 118, 110, 0.1) 52px)'
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-6 sm:px-12 sm:py-8">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-700 to-teal-900 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-teal-700 to-teal-900 rounded-2xl flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                <MapPin className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-900">GeoSift</h1>
              <p className="text-xs text-stone-500 font-medium -mt-0.5">Property Intelligence</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left - Hero Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-100/60 backdrop-blur-sm rounded-full border border-teal-200/50">
                    <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                    <span className="text-xs font-semibold text-teal-800 tracking-wide">AI-POWERED</span>
                  </div>

                  <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none">
                    <span className="text-stone-900">Discover</span>
                    <br />
                    <span className="relative inline-block">
                      <span className="relative z-10 text-teal-700">Properties</span>
                      <svg className="absolute -bottom-2 left-0 w-full h-4" viewBox="0 0 200 12" preserveAspectRatio="none">
                        <path d="M0,7 Q50,0 100,7 T200,7" stroke="#f97316" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.3" />
                      </svg>
                    </span>
                  </h2>
                </div>

                <p className="text-lg sm:text-xl text-stone-600 leading-relaxed max-w-md font-medium">
                  Access comprehensive building data from Overture Maps and OpenStreetMap with intelligent filtering.
                </p>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="group">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Layers className="w-5 h-5 text-teal-700" />
                    </div>
                    <div className="text-2xl font-bold text-stone-900">2.8M+</div>
                    <div className="text-xs text-stone-500 font-medium">Buildings</div>
                  </div>
                  <div className="group">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Zap className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-stone-900">50+</div>
                    <div className="text-xs text-stone-500 font-medium">Filters</div>
                  </div>
                  <div className="group">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-2xl font-bold text-stone-900">Real-time</div>
                    <div className="text-xs text-stone-500 font-medium">Updates</div>
                  </div>
                </div>
              </div>

              {/* Right - Auth Form */}
              <div className="w-full max-w-md mx-auto lg:mx-0">
                <div className="relative group">
                  {/* Card shadow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-teal-600/20 to-orange-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />

                  <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-stone-200/50 shadow-2xl p-8 sm:p-10">
                    {/* Tab switcher */}
                    <div className="flex gap-2 mb-8">
                      <button
                        onClick={() => { setIsLoginView(true); setErrors({}); }}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${isLoginView ? 'bg-gradient-to-br from-teal-700 to-teal-800 text-white shadow-lg shadow-teal-700/30' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => { setIsLoginView(false); setErrors({}); }}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${!isLoginView
                          ? 'bg-gradient-to-br from-teal-700 to-teal-800 text-white shadow-lg shadow-teal-700/30'
                          : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                          }`}
                      >
                        Sign Up
                      </button>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-2xl font-black text-stone-900 mb-2">
                        {isLoginView ? 'Welcome back' : 'Get started'}
                      </h3>
                      <p className="text-sm text-stone-500 font-medium">
                        {isLoginView
                          ? 'Sign in to access your workspace'
                          : 'Create your account today'}
                      </p>
                    </div>

                    <form onSubmit={isLoginView ? handleLogin : handleRegister} className="space-y-4">
                      {!isLoginView && (
                        <div className="grid grid-cols-2 gap-3">
                          <InputField
                            icon={User}
                            name="name"
                            placeholder="Full name"
                            value={userData.name}
                            onChange={handleChange}
                            error={errors.name}
                          />
                          <InputField
                            icon={Phone}
                            name="phone"
                            placeholder="Phone"
                            value={userData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                          />
                        </div>
                      )}

                      <InputField
                        icon={Mail}
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={userData.email}
                        onChange={handleChange}
                        error={errors.email}
                      />

                      {!isLoginView && (
                        <>
                          <InputField
                            icon={Building2}
                            name="organization"
                            placeholder="Organization"
                            value={userData.organization}
                            onChange={handleChange}
                            error={errors.organization}
                          />
                        </>
                      )}

                      <div className={!isLoginView ? 'grid grid-cols-2 gap-3' : ''}>
                        <InputField
                          icon={Lock}
                          type="password"
                          name="password"
                          placeholder="Password"
                          value={userData.password}
                          onChange={handleChange}
                          error={errors.password}
                        />
                        {!isLoginView && (
                          <InputField
                            icon={CheckCircle2}
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm"
                            value={userData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                          />
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative w-full group mt-6"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-700 to-teal-900 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
                        <div className={`relative flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-br from-teal-700 to-teal-900 text-white font-bold rounded-xl transition-all duration-200 ${isSubmitting ? 'opacity-80' : 'hover:scale-[1.02] active:scale-[0.98]'
                          }`}>
                          {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              {isLoginView ? 'Sign In' : 'Create Account'}
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </div>
                      </button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-stone-600">
                        {isLoginView ? "Don't have an account? " : 'Already have an account? '}
                        <button
                          type="button"
                          onClick={() => { setIsLoginView(!isLoginView); setErrors({}); }}
                          className="font-bold text-teal-700 hover:text-teal-800 transition-colors underline decoration-2 decoration-teal-300 underline-offset-2"
                        >
                          {isLoginView ? 'Sign up' : 'Sign in'}
                        </button>
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-stone-400 mt-6 font-medium">
                  Powered by Overture Maps & OpenStreetMap
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}