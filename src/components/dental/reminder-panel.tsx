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
    const styles: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
      ready: { color: 'bg-blue-500/20 text-blue-400', icon: Send },
      sent: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      failed: { color: 'bg-red-500/20 text-red-400', icon: XCircle },
      cancelled: { color: 'bg-gray-500/20 text-gray-400', icon: XCircle }
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
      <Badge className={style.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status === 'ready' ? 'Listo para enviar' : status}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      '24h': '24 horas antes',
      '2h': '2 horas antes',
      '1h': '1 hora antes'
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
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                <p className="text-xs text-gray-400">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.ready}</p>
                <p className="text-xs text-gray-400">Listos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.sent}</p>
                <p className="text-xs text-gray-400">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.failed}</p>
                <p className="text-xs text-gray-400">Fallidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs y acciones */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab('pending')}
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            className={activeTab === 'pending' ? 'bg-[#0077B6]' : ''}
          >
            <Bell className="w-4 h-4 mr-2" />
            Por Enviar
          </Button>
          <Button
            onClick={() => setActiveTab('sent')}
            variant={activeTab === 'sent' ? 'default' : 'outline'}
            className={activeTab === 'sent' ? 'bg-[#0077B6]' : ''}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Enviados
          </Button>
          <Button
            onClick={() => setActiveTab('config')}
            variant={activeTab === 'config' ? 'default' : 'outline'}
            className={activeTab === 'config' ? 'bg-[#0077B6]' : ''}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
        </div>
        <Button onClick={processReminders} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Procesar Ahora
        </Button>
      </div>

      {/* Contenido */}
      {activeTab === 'config' ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Configuración de Recordatorios</CardTitle>
            <CardDescription>
              Personaliza cuándo y cómo se envían los recordatorios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Activar/Desactivar */}
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div>
                <Label className="text-white font-medium">Sistema de Recordatorios</Label>
                <p className="text-sm text-gray-400">Activa o desactiva todos los recordatorios</p>
              </div>
              <Switch
                checked={config?.isActive ?? true}
                onCheckedChange={(checked) => updateConfig({ isActive: checked })}
              />
            </div>

            {/* Tipos de recordatorio */}
            <div className="space-y-3">
              <Label className="text-white font-medium">Momento de envío</Label>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">24 horas antes de la cita</span>
                  <Switch
                    checked={config?.reminder24hEnabled ?? true}
                    onCheckedChange={(checked) => updateConfig({ reminder24hEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">2 horas antes de la cita</span>
                  <Switch
                    checked={config?.reminder2hEnabled ?? true}
                    onCheckedChange={(checked) => updateConfig({ reminder2hEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">1 hora antes de la cita</span>
                  <Switch
                    checked={config?.reminder1hEnabled ?? false}
                    onCheckedChange={(checked) => updateConfig({ reminder1hEnabled: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Plantilla de mensaje */}
            <div className="space-y-3">
              <Label className="text-white font-medium">Plantilla de WhatsApp</Label>
              <p className="text-sm text-gray-400">
                Variables: {'{nombre}'}, {'{fecha}'}, {'{hora}'}, {'{tratamiento}'}
              </p>
              <Textarea
                value={config?.whatsappTemplate || ''}
                onChange={(e) => updateConfig({ whatsappTemplate: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                placeholder="¡Hola {nombre}! Te recordamos tu cita..."
              />
            </div>

            {/* Datos de la clínica */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Nombre de la clínica</Label>
                <Input
                  value={config?.clinicName || ''}
                  onChange={(e) => updateConfig({ clinicName: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Teléfono de la clínica</Label>
                <Input
                  value={config?.clinicPhone || ''}
                  onChange={(e) => updateConfig({ clinicPhone: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReminders.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No hay recordatorios en esta categoría</p>
              </CardContent>
            </Card>
          ) : (
            filteredReminders.map((reminder) => (
              <Card key={reminder.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{reminder.appointment?.patientName}</h4>
                        {getStatusBadge(reminder.status)}
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(reminder.type)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                        <div>
                          <span className="text-gray-500">Cita:</span>{' '}
                          {formatDate(reminder.appointment?.date || '')} a las {formatTime(reminder.appointment?.time || '')}
                        </div>
                        <div>
                          <span className="text-gray-500">Tel:</span> {reminder.appointment?.patientPhone}
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Tratamiento:</span> {reminder.appointment?.treatment}
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs text-gray-300">
                        {reminder.message}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {reminder.status === 'ready' && (
                        <>
                          <Button
                            onClick={() => sendWhatsApp(reminder)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Enviar WhatsApp
                          </Button>
                          <Button
                            onClick={() => markAsSent(reminder.id)}
                            variant="outline"
                            className="border-green-600 text-green-400"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {reminder.status === 'pending' && (
                        <Button
                          onClick={() => cancelReminder(reminder.id)}
                          variant="outline"
                          className="border-red-600 text-red-400"
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
