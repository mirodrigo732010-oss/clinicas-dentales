'use client';

import { useState, useEffect } from 'react';
import { Bell, Send, Settings, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, MessageCircle, ExternalLink, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Reminder {
  id: string;
  appointmentId: string;
  type: string;
  status: string;
  channel: string;
  message: string;
  scheduledFor: string;
  sentAt: string | null;
  error: string | null;
  appointment: {
    patientName: string;
    patientPhone: string;
    date: string;
    time: string;
    treatment: string;
  };
}

interface ReminderConfig {
  id: string;
  isActive: boolean;
  reminder24hEnabled: boolean;
  reminder2hEnabled: boolean;
  reminder1hEnabled: boolean;
  whatsappTemplate: string;
  smsTemplate: string;
  clinicPhone: string;
  clinicName: string;
}

const REMINDER_SERVICE_PORT = 3005;

export function ReminderPanel() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [config, setConfig] = useState<ReminderConfig | null>(null);
  const [stats, setStats] = useState({ pending: 0, ready: 0, sent: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'ready' | 'sent' | 'config'>('pending');

  // Cargar datos
  const fetchData = async () => {
    try {
      // Obtener recordatorios
      const res = await fetch('/api/admin/reminders');
      const data = await res.json();
      setReminders(data.reminders || []);
      setConfig(data.config);

      // Obtener estadísticas del servicio
      try {
        const statsRes = await fetch(`/api/reminder-proxy/stats?XTransformPort=${REMINDER_SERVICE_PORT}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (e) {
        // Si el servicio no está disponible, calcular de la DB
        const pending = reminders.filter(r => r.status === 'pending').length;
        const ready = reminders.filter(r => r.status === 'ready').length;
        const sent = reminders.filter(r => r.status === 'sent').length;
        const failed = reminders.filter(r => r.status === 'failed').length;
        setStats({ pending, ready, sent, failed });
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Procesar recordatorios manualmente
  const processReminders = async () => {
    try {
      await fetch(`/api/reminder-proxy/process?XTransformPort=${REMINDER_SERVICE_PORT}`, { method: 'POST' });
      fetchData();
    } catch (error) {
      console.error('Error procesando recordatorios:', error);
    }
  };

  // Enviar recordatorio por WhatsApp
  const sendWhatsApp = (reminder: Reminder) => {
    const phone = reminder.appointment.patientPhone.replace(/\D/g, '');
    const fullPhone = phone.length === 10 ? `521${phone}` : `52${phone}`;
    const message = encodeURIComponent(reminder.message);
    window.open(`https://wa.me/${fullPhone}?text=${message}`, '_blank');
  };

  // Marcar como enviado
  const markAsSent = async (id: string) => {
    try {
      await fetch(`/api/reminder-proxy/mark-sent?XTransformPort=${REMINDER_SERVICE_PORT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchData();
    } catch (error) {
      console.error('Error marcando como enviado:', error);
    }
  };

  // Actualizar configuración
  const updateConfig = async (updates: Partial<ReminderConfig>) => {
    if (!config) return;
    try {
      await fetch('/api/admin/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateConfig: true,
          configId: config.id,
          ...config,
          ...updates
        })
      });
      setConfig({ ...config, ...updates });
    } catch (error) {
      console.error('Error actualizando configuración:', error);
    }
  };

  // Cancelar recordatorio
  const cancelReminder = async (id: string) => {
    try {
      await fetch(`/api/admin/reminders?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error cancelando recordatorio:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
      ready: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Send },
      sent: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      failed: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', icon: XCircle }
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
      <Badge className={`${style.bg} ${style.text} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status === 'ready' ? 'Listo' : status === 'pending' ? 'Pendiente' : status === 'sent' ? 'Enviado' : status}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      '24h': '24h antes',
      '2h': '2h antes',
      '1h': '1h antes'
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    return `${h > 12 ? h - 12 : h}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  // Filtrar recordatorios por estado
  const filteredReminders = reminders.filter(r => {
    if (activeTab === 'pending') return r.status === 'pending' || r.status === 'ready';
    if (activeTab === 'sent') return r.status === 'sent';
    if (activeTab === 'config') return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-[#0077B6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.ready}</p>
                <p className="text-xs text-gray-500">Listos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
                <p className="text-xs text-gray-500">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
                <p className="text-xs text-gray-500">Fallidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs y acciones */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setActiveTab('pending')}
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            className={activeTab === 'pending' ? 'bg-[#0077B6] hover:bg-[#005a8c]' : ''}
          >
            <Bell className="w-4 h-4 mr-2" />
            Por Enviar
          </Button>
          <Button
            onClick={() => setActiveTab('sent')}
            variant={activeTab === 'sent' ? 'default' : 'outline'}
            className={activeTab === 'sent' ? 'bg-[#0077B6] hover:bg-[#005a8c]' : ''}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Enviados
          </Button>
          <Button
            onClick={() => setActiveTab('config')}
            variant={activeTab === 'config' ? 'default' : 'outline'}
            className={activeTab === 'config' ? 'bg-[#0077B6] hover:bg-[#005a8c]' : ''}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
        </div>
        <Button onClick={processReminders} variant="outline" className="border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6]/10">
          <RefreshCw className="w-4 h-4 mr-2" />
          Procesar Ahora
        </Button>
      </div>

      {/* Contenido */}
      {activeTab === 'config' ? (
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#0077B6]/5 to-[#00a8e8]/5 border-b">
            <CardTitle className="text-[#0077B6]">Configuración de Recordatorios</CardTitle>
            <CardDescription className="text-gray-600">
              Personaliza cuándo y cómo se envían los recordatorios
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Activar/Desactivar */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0077B6]/5 to-[#00a8e8]/5 rounded-xl border border-[#0077B6]/20">
              <div>
                <Label className="text-gray-900 font-semibold text-base">Sistema de Recordatorios</Label>
                <p className="text-sm text-gray-500 mt-0.5">Activa o desactiva todos los recordatorios</p>
              </div>
              <Switch
                checked={config?.isActive ?? true}
                onCheckedChange={(checked) => updateConfig({ isActive: checked })}
                className="data-[state=checked]:bg-[#0077B6]"
              />
            </div>

            {/* Tipos de recordatorio */}
            <div className="space-y-3">
              <Label className="text-gray-900 font-semibold text-base">Momento de envío</Label>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#0077B6]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-gray-700 font-medium">24 horas antes de la cita</span>
                  </div>
                  <Switch
                    checked={config?.reminder24hEnabled ?? true}
                    onCheckedChange={(checked) => updateConfig({ reminder24hEnabled: checked })}
                    className="data-[state=checked]:bg-[#0077B6]"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#0077B6]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">2 horas antes de la cita</span>
                  </div>
                  <Switch
                    checked={config?.reminder2hEnabled ?? true}
                    onCheckedChange={(checked) => updateConfig({ reminder2hEnabled: checked })}
                    className="data-[state=checked]:bg-[#0077B6]"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#0077B6]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">1 hora antes de la cita</span>
                  </div>
                  <Switch
                    checked={config?.reminder1hEnabled ?? false}
                    onCheckedChange={(checked) => updateConfig({ reminder1hEnabled: checked })}
                    className="data-[state=checked]:bg-[#0077B6]"
                  />
                </div>
              </div>
            </div>

            {/* Plantilla de mensaje */}
            <div className="space-y-3">
              <Label className="text-gray-900 font-semibold text-base">Plantilla de WhatsApp</Label>
              <p className="text-sm text-gray-500 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <span className="font-medium text-amber-700">Variables disponibles:</span>{' '}
                <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">{'{nombre}'}</code>{', '}
                <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">{'{fecha}'}</code>{', '}
                <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">{'{hora}'}</code>{', '}
                <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">{'{tratamiento}'}</code>
              </p>
              <Textarea
                value={config?.whatsappTemplate || ''}
                onChange={(e) => updateConfig({ whatsappTemplate: e.target.value })}
                className="min-h-[120px] border-gray-300 focus:border-[#0077B6] focus:ring-[#0077B6] text-gray-900 bg-white"
                placeholder="¡Hola {nombre}! Te recordamos tu cita en Clínica Dental Sonrisa Perfecta el {fecha} a las {hora}. Tratamiento: {tratamiento}. ¡Te esperamos!"
              />
            </div>

            {/* Datos de la clínica */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-900 font-medium">Nombre de la clínica</Label>
                <Input
                  value={config?.clinicName || ''}
                  onChange={(e) => updateConfig({ clinicName: e.target.value })}
                  className="border-gray-300 focus:border-[#0077B6] focus:ring-[#0077B6] text-gray-900 bg-white"
                  placeholder="Clínica Dental Sonrisa Perfecta"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 font-medium">Teléfono de la clínica</Label>
                <Input
                  value={config?.clinicPhone || ''}
                  onChange={(e) => updateConfig({ clinicPhone: e.target.value })}
                  className="border-gray-300 focus:border-[#0077B6] focus:ring-[#0077B6] text-gray-900 bg-white"
                  placeholder="5517489261"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReminders.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium text-lg">No hay recordatorios en esta categoría</p>
                <p className="text-gray-400 text-sm mt-1">Los recordatorios aparecerán aquí cuando se programen citas</p>
              </CardContent>
            </Card>
          ) : (
            filteredReminders.map((reminder) => (
              <Card key={reminder.id} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-[#0077B6]">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#0077B6]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#0077B6] font-bold">
                            {reminder.appointment?.patientName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{reminder.appointment?.patientName}</h4>
                          <p className="text-sm text-gray-500">{reminder.appointment?.patientPhone}</p>
                        </div>
                        {getStatusBadge(reminder.status)}
                        <Badge variant="outline" className="text-xs border-[#0077B6]/30 text-[#0077B6]">
                          {getTypeLabel(reminder.type)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-[#0077B6]" />
                          <span>{formatDate(reminder.appointment?.date || '')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 text-[#0077B6]" />
                          <span>{formatTime(reminder.appointment?.time || '')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 col-span-2 md:col-span-1">
                          <MessageCircle className="w-4 h-4 text-[#0077B6]" />
                          <span>{reminder.appointment?.treatment}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700">{reminder.message}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {reminder.status === 'ready' && (
                        <>
                          <Button
                            onClick={() => sendWhatsApp(reminder)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                          <Button
                            onClick={() => markAsSent(reminder.id)}
                            variant="outline"
                            className="border-green-600 text-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {reminder.status === 'pending' && (
                        <Button
                          onClick={() => cancelReminder(reminder.id)}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Import Calendar icon
function Calendar(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  );
}
