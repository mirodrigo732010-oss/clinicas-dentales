'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Mail, AlertCircle, LogOut, Settings, Calendar, 
  Save, RefreshCw, Eye, EyeOff,
  BookOpen, Bot, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { DoctorPanel } from '@/components/dental/doctor-panel';
import { KnowledgePanel } from '@/components/dental/knowledge-panel';
import { AssistantConfigPanel } from '@/components/dental/assistant-config-panel';
import { ReminderPanel } from '@/components/dental/reminder-panel';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'citas' | 'recordatorios' | 'conocimiento' | 'asistente'>('citas');

  // Check session
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
      } else {
        setLoginError(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      setLoginError('Error de conexión');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setUser(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-8 h-8 text-[#0077B6] animate-spin" />
      </div>
    );
  }

  // Login form
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0077B6]/10 to-[#00a8e8]/10 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0077B6] to-[#00a8e8] rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Panel de Administración</CardTitle>
              <p className="text-gray-500 text-sm mt-1">Clínica Dental Sonrisa Perfecta</p>
            </CardHeader>
            <div className="p-6 pt-0">
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {loginError}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="admin@sonrisaperfecta.es"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0077B6] hover:bg-[#005a8c] text-white py-6"
                >
                  Iniciar Sesión
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Demo: admin@sonrisaperfecta.es / admin123
                </p>
              </form>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0077B6] to-[#00a8e8] rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl text-gray-900">
                  Panel de Administración
                </h1>
                <p className="text-sm text-gray-500">Bienvenido, {user.name || user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setActiveTab('citas')}
                variant={activeTab === 'citas' ? 'default' : 'ghost'}
                className={activeTab === 'citas' ? 'bg-[#0077B6] text-white' : ''}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Citas
              </Button>
              <Button
                onClick={() => setActiveTab('recordatorios')}
                variant={activeTab === 'recordatorios' ? 'default' : 'ghost'}
                className={activeTab === 'recordatorios' ? 'bg-[#0077B6] text-white' : ''}
              >
                <Bell className="w-4 h-4 mr-2" />
                Recordatorios
              </Button>
              <Button
                onClick={() => setActiveTab('conocimiento')}
                variant={activeTab === 'conocimiento' ? 'default' : 'ghost'}
                className={activeTab === 'conocimiento' ? 'bg-[#0077B6] text-white' : ''}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Conocimiento
              </Button>
              <Button
                onClick={() => setActiveTab('asistente')}
                variant={activeTab === 'asistente' ? 'default' : 'ghost'}
                className={activeTab === 'asistente' ? 'bg-[#0077B6] text-white' : ''}
              >
                <Bot className="w-4 h-4 mr-2" />
                Asistente
              </Button>
              <Button onClick={handleLogout} variant="ghost" className="text-gray-600">
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>
        {activeTab === 'citas' && <DoctorPanel />}

        {activeTab === 'recordatorios' && (
          <div className="container mx-auto px-4 py-8">
            <ReminderPanel />
          </div>
        )}

        {activeTab === 'conocimiento' && (
          <div className="container mx-auto px-4 py-8">
            <KnowledgePanel />
          </div>
        )}

        {activeTab === 'asistente' && (
          <div className="container mx-auto px-4 py-8">
            <AssistantConfigPanel />
          </div>
        )}
      </main>
    </div>
  );
}
