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
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Obtener todas las citas del mes actual
      const startDate = new Date(currentMonth.year, currentMonth.month, 1);
      const endDate = new Date(currentMonth.year, currentMonth.month + 1, 0);
      
      const formatDateStr = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      const response = await fetch(`/api/calendar?startDate=${formatDateStr(startDate)}&endDate=${formatDateStr(endDate)}`);
      const data = await response.json();
      
      const mappedAppointments = (data.appointments || []).map((apt: Appointment) => ({
        ...apt,
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
  }, [currentMonth]);

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

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const newMonth = prev.month + direction;
      if (newMonth < 0) {
        return { year: prev.year - 1, month: 11 };
      } else if (newMonth > 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: newMonth };
    });
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

  const formatMonthYear = () => {
    const date = new Date(currentMonth.year, currentMonth.month, 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const firstDay = new Date(currentMonth.year, currentMonth.month, 1);
    const lastDay = new Date(currentMonth.year, currentMonth.month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = domingo

    const days: Array<{ date: string; isCurrentMonth: boolean; appointments: Appointment[] }> = [];

    // Días del mes anterior
    const prevMonth = new Date(currentMonth.year, currentMonth.month, 0);
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      const date = formatDateString(currentMonth.year, currentMonth.month - 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        appointments: appointments.filter(a => a.date === date)
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDateString(currentMonth.year, currentMonth.month + 1, day);
      days.push({
        date,
        isCurrentMonth: true,
        appointments: appointments.filter(a => a.date === date)
      });
    }

    // Días del siguiente mes
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const date = formatDateString(currentMonth.year, currentMonth.month + 2, day);
      days.push({
        date,
        isCurrentMonth: false,
        appointments: appointments.filter(a => a.date === date)
      });
    }

    return days;
  };

  const formatDateString = (year: number, month: number, day: number) => {
    const actualMonth = month < 1 ? 12 : month > 12 ? 1 : month;
    const actualYear = month < 1 ? year - 1 : month > 12 ? year + 1 : year;
    return `${actualYear}-${String(actualMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Generar link de WhatsApp para contactar al paciente
  const getPatientWhatsAppLink = (appointment: Appointment) => {
    const message = `Hola ${appointment.patientName}, le escribimos de Clínica Dental Sonrisa Perfecta para confirmar su cita el ${formatDate(appointment.date)} a las ${appointment.time}. ¿Podría confirmar su asistencia?`;
    const cleanPhone = appointment.patientPhone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const todayStr = getMexicoDate();
  const selectedDayAppointments = appointments.filter(a => a.date === selectedDate);
  const calendarDays = generateCalendarDays();
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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
                  Calendario de Citas
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
          {/* Calendar - Calendario Completo */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#0077B6] to-[#00a8e8] text-white pb-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth(-1)}
                    className="text-white hover:bg-white/20"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <CardTitle className="text-lg capitalize">
                    {formatMonthYear()}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth(1)}
                    className="text-white hover:bg-white/20"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Días del calendario */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isSelected = day.date === selectedDate;
                    const isToday = day.date === todayStr;
                    const hasAppointments = day.appointments.length > 0;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day.date)}
                        className={cn(
                          'relative aspect-square p-1 rounded-lg text-sm font-medium transition-all',
                          'flex flex-col items-center justify-center',
                          day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                          isSelected && 'bg-[#0077B6] text-white shadow-md',
                          isToday && !isSelected && 'bg-[#0077B6]/10 text-[#0077B6] font-bold',
                          !isSelected && !isToday && 'hover:bg-gray-100'
                        )}
                      >
                        <span>{parseInt(day.date.split('-')[2])}</span>
                        {hasAppointments && (
                          <div className="flex gap-0.5 mt-0.5">
                            {day.appointments.slice(0, 3).map((apt, i) => (
                              <div
                                key={i}
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  apt.status === 'confirmed' && 'bg-green-500',
                                  apt.status === 'pending' && 'bg-yellow-500',
                                  apt.status === 'completed' && 'bg-blue-500',
                                  apt.status === 'cancelled' && 'bg-red-500',
                                  isSelected && 'bg-white/80'
                                )}
                              />
                            ))}
                            {day.appointments.length > 3 && (
                              <span className={cn(
                                'text-[8px] font-bold',
                                isSelected ? 'text-white' : 'text-gray-500'
                              )}>
                                +{day.appointments.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Leyenda */}
                <div className="mt-4 pt-3 border-t">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Estados de citas:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-gray-600">Confirmada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-gray-600">Pendiente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-gray-600">Completada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-gray-600">Cancelada</span>
                    </div>
                  </div>
                </div>

                {/* Resumen del día seleccionado */}
                <div className="mt-4 pt-3 border-t">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Resumen del día:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total citas:</span>
                      <span className="font-bold text-[#0077B6]">{selectedDayAppointments.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Confirmadas:</span>
                      <span className="font-semibold text-green-600">
                        {selectedDayAppointments.filter(a => a.status === 'confirmed').length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pendientes:</span>
                      <span className="font-semibold text-yellow-600">
                        {selectedDayAppointments.filter(a => a.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="bg-gradient-to-r from-[#0077B6]/5 to-[#00a8e8]/5">
                <CardTitle className="text-lg capitalize flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#0077B6]" />
                  {formatDate(selectedDate)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-[#0077B6] animate-spin" />
                  </div>
                ) : selectedDayAppointments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">No hay citas programadas para este día</p>
                    <p className="text-sm mt-1">Selecciona otro día en el calendario</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    <AnimatePresence>
                      {selectedDayAppointments
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((appointment) => (
                          <motion.div
                            key={appointment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={cn(
                              'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md',
                              selectedAppointment?.id === appointment.id
                                ? 'border-[#0077B6] bg-[#0077B6]/5 shadow-md'
                                : 'border-gray-200 bg-white hover:border-[#0077B6]/30'
                            )}
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-center min-w-[60px] bg-[#0077B6]/10 rounded-lg p-2">
                                  <Clock className="w-5 h-5 text-[#0077B6] mx-auto mb-1" />
                                  <span className="font-bold text-lg text-[#0077B6]">{appointment.time}</span>
                                </div>
                                <div>
                                  <div className="font-semibold flex items-center gap-2 text-gray-900">
                                    <User className="w-4 h-4 text-gray-400" />
                                    {appointment.patientName}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <Phone className="w-3 h-3" />
                                    {appointment.patientPhone}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
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
