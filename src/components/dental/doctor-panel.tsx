'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, User, Phone, Mail, X, 
  ChevronLeft, ChevronRight, Trash2, Check, 
  XCircle, AlertCircle, RefreshCw, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Interface correcta basada en el schema de Prisma
interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  date: string;
  time: string;
  treatment?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

// WhatsApp del doctor
const WHATSAPP_NUMBER = '5215517489261';

export function DoctorPanel() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Helper para obtener fecha en zona horaria de México
  const getMexicoDate = useCallback(() => {
    const now = new Date();
    const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
    const year = mexicoTime.getFullYear();
    const month = String(mexicoTime.getMonth() + 1).padStart(2, '0');
    const day = String(mexicoTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(getMexicoDate());

  // Actualizar fecha seleccionada cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      // Solo actualizar si no ha seleccionado otra fecha
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar?view=doctor&date=${selectedDate}`);
      const data = await response.json();
      // Mapear los campos correctamente
      const mappedAppointments = (data.appointments || []).map((apt: Appointment) => ({
        ...apt,
        // Asegurar que los campos tengan valor
        patientName: apt.patientName || 'Sin nombre',
        patientPhone: apt.patientPhone || 'Sin teléfono',
        patientEmail: apt.patientEmail || '',
        treatment: apt.treatment || 'Valoración inicial',
        notes: apt.notes || '',
      }));
      setAppointments(mappedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const cancelAppointment = async (id: string) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    try {
      await fetch(`/api/calendar?id=${id}`, { method: 'DELETE' });
      fetchAppointments();
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const navigateDate = (days: number) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    date.setDate(date.getDate() + days);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${newYear}-${newMonth}-${newDay}`);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatMonthYear = (dateStr: string) => {
    const [year, month] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, 15, 12, 0, 0);
    return date.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Generar link de WhatsApp para contactar al paciente
  const getPatientWhatsAppLink = (appointment: Appointment) => {
    const message = `Hola ${appointment.patientName}, le escribimos de Clínica Dental Sonrisa Perfecta para confirmar su cita el ${formatDate(appointment.date)} a las ${appointment.time}. ¿Podría confirmar su asistencia?`;
    // Limpiar el teléfono para WhatsApp
    const cleanPhone = appointment.patientPhone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const todayAppointments = appointments.filter(a => a.date === selectedDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0077B6] rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl text-gray-900">
                  Panel del Doctor
                </h1>
                <p className="text-sm text-gray-500">Gestión de Citas</p>
              </div>
            </div>
            <Button
              onClick={fetchAppointments}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#0077B6]" />
                  Seleccionar Fecha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate(-1)}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="text-center">
                    <div className="font-semibold capitalize">
                      {formatMonthYear(selectedDate)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate(1)}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />

                <Button
                  onClick={() => setSelectedDate(getMexicoDate())}
                  variant="outline"
                  className="w-full mt-3"
                >
                  Ir a Hoy
                </Button>

                {/* Quick Stats */}
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Citas del día:</span>
                    <span className="font-semibold">{todayAppointments.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Confirmadas:</span>
                    <span className="font-semibold text-green-600">
                      {todayAppointments.filter(a => a.status === 'confirmed').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pendientes:</span>
                    <span className="font-semibold text-yellow-600">
                      {todayAppointments.filter(a => a.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Completadas:</span>
                    <span className="font-semibold text-blue-600">
                      {todayAppointments.filter(a => a.status === 'completed').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg capitalize">
                  {formatDate(selectedDate)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-[#0077B6] animate-spin" />
                  </div>
                ) : todayAppointments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay citas programadas para este día</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {todayAppointments
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((appointment) => (
                          <motion.div
                            key={appointment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={cn(
                              'p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                              selectedAppointment?.id === appointment.id
                                ? 'border-[#0077B6] bg-[#0077B6]/5'
                                : 'border-gray-200 bg-white'
                            )}
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-center min-w-[60px]">
                                  <Clock className="w-5 h-5 text-[#0077B6] mx-auto" />
                                  <span className="font-bold text-lg">{appointment.time}</span>
                                </div>
                                <div>
                                  <div className="font-semibold flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    {appointment.patientName}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <Phone className="w-3 h-3" />
                                    {appointment.patientPhone}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {appointment.treatment}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={statusColors[appointment.status]}>
                                  {statusLabels[appointment.status]}
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Appointment Detail Modal */}
        <AnimatePresence>
          {selectedAppointment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedAppointment(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-[#0077B6] to-[#00a8e8] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-heading font-bold">
                      Detalle de Cita
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedAppointment(null)}
                      className="text-white/80 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#0077B6]" />
                    <div>
                      <div className="font-semibold">
                        {selectedAppointment.time} - {formatDate(selectedAppointment.date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#0077B6]" />
                    <div>
                      <div className="font-semibold">{selectedAppointment.patientName}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#0077B6]" />
                    <a 
                      href={`tel:${selectedAppointment.patientPhone}`}
                      className="text-[#0077B6] hover:underline"
                    >
                      {selectedAppointment.patientPhone}
                    </a>
                  </div>

                  {selectedAppointment.patientEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#0077B6]" />
                      <a 
                        href={`mailto:${selectedAppointment.patientEmail}`}
                        className="text-[#0077B6] hover:underline"
                      >
                        {selectedAppointment.patientEmail}
                      </a>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-500 mb-1">Tratamiento</div>
                    <div className="font-medium">{selectedAppointment.treatment || 'Valoración inicial'}</div>
                  </div>

                  {selectedAppointment.notes && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Notas</div>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        {selectedAppointment.notes}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Estado:</span>
                    <Badge className={statusColors[selectedAppointment.status]}>
                      {statusLabels[selectedAppointment.status]}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    {/* WhatsApp button */}
                    <a
                      href={getPatientWhatsAppLink(selectedAppointment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                    
                    {selectedAppointment.status !== 'confirmed' && (
                      <Button
                        onClick={() => updateStatus(selectedAppointment.id, 'confirmed')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Confirmar
                      </Button>
                    )}
                    {selectedAppointment.status !== 'completed' && (
                      <Button
                        onClick={() => updateStatus(selectedAppointment.id, 'completed')}
                        variant="outline"
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Completada
                      </Button>
                    )}
                    <Button
                      onClick={() => cancelAppointment(selectedAppointment.id)}
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
