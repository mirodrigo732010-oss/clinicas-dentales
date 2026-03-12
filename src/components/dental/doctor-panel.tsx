'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, User, Phone, Mail, X,
  Trash2, Check, RefreshCw, MessageCircle, Stethoscope, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

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

const parseDateString = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

const dateToString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function DoctorPanel() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const getMexicoDate = useCallback(() => {
    const now = new Date();
    const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
    return dateToString(mexicoTime);
  }, []);

  const [selectedDate, setSelectedDate] = useState(getMexicoDate());

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/appointments', { cache: 'no-store' });
      const data = await response.json();
      const mappedAppointments = (data.appointments || []).map((apt: Appointment) => ({
        ...apt,
        patientName: apt.patientName || 'Sin nombre',
        patientPhone: apt.patientPhone || 'Sin teléfono',
        patientEmail: apt.patientEmail || '',
        treatment: apt.treatment || 'Valoración inicial',
        notes: apt.notes || '',
      }));
      setAppointments(mappedAppointments.filter((apt: Appointment) => apt.status !== 'cancelled'));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      await fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const cancelAppointment = async (id: string) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    try {
      await fetch(`/api/calendar?id=${id}`, { method: 'DELETE' });
      await fetchAppointments();
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const formatDateLong = (dateStr: string) => format(parseDateString(dateStr), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  const formatMonthYear = (dateStr: string) => format(parseDateString(dateStr), 'MMMM yyyy', { locale: es });

  const getPatientWhatsAppLink = (appointment: Appointment) => {
    const message = `Hola ${appointment.patientName}, le escribimos de Clínica Dental Sonrisa Perfecta para confirmar su cita el ${formatDateLong(appointment.date)} a las ${appointment.time}. ¿Podría confirmar su asistencia?`;
    const cleanPhone = appointment.patientPhone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const appointmentsByDate = useMemo(() => {
    return appointments.reduce<Record<string, Appointment[]>>((acc, appointment) => {
      if (!acc[appointment.date]) acc[appointment.date] = [];
      acc[appointment.date].push(appointment);
      return acc;
    }, {});
  }, [appointments]);

  const selectedDayAppointments = useMemo(() => {
    return [...(appointmentsByDate[selectedDate] || [])].sort((a, b) => a.time.localeCompare(b.time));
  }, [appointmentsByDate, selectedDate]);

  const appointmentDates = useMemo(() => Object.keys(appointmentsByDate).map(parseDateString), [appointmentsByDate]);
  const selectedDateObj = useMemo(() => parseDateString(selectedDate), [selectedDate]);

  const monthAppointments = useMemo(() => {
    const monthKey = selectedDate.slice(0, 7);
    return appointments.filter((appointment) => appointment.date.startsWith(monthKey));
  }, [appointments, selectedDate]);

  const monthStats = useMemo(() => ({
    total: monthAppointments.length,
    confirmed: monthAppointments.filter((a) => a.status === 'confirmed').length,
    pending: monthAppointments.filter((a) => a.status === 'pending').length,
    completed: monthAppointments.filter((a) => a.status === 'completed').length,
  }), [monthAppointments]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#0077B6] rounded-2xl flex items-center justify-center shadow-sm">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl text-slate-900">Panel del Doctor</h1>
                <p className="text-sm text-slate-500">Calendario y gestión de citas</p>
              </div>
            </div>
            <Button onClick={fetchAppointments} variant="outline" size="sm" className="gap-2 border-slate-200 bg-white">
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              Actualizar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Citas del mes</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{monthStats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Confirmadas</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{monthStats.confirmed}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Pendientes</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{monthStats.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Completadas</p>
              <p className="text-3xl font-bold text-sky-600 mt-1">{monthStats.completed}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-6 items-start">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-br from-sky-50 to-white">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                <CalendarIcon className="w-5 h-5 text-[#0077B6]" />
                Calendario de citas
              </CardTitle>
              <p className="text-sm text-slate-500 capitalize">{formatMonthYear(selectedDate)}</p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-inner">
                <Calendar
                  mode="single"
                  selected={selectedDateObj}
                  onSelect={(date) => date && setSelectedDate(dateToString(date))}
                  month={selectedDateObj}
                  onMonthChange={(date) => {
                    const currentDay = parseDateString(selectedDate).getDate();
                    const safeDate = new Date(date.getFullYear(), date.getMonth(), Math.min(currentDay, 28), 12, 0, 0);
                    setSelectedDate(dateToString(safeDate));
                  }}
                  modifiers={{ hasAppointments: appointmentDates }}
                  modifiersClassNames={{
                    hasAppointments: 'relative before:absolute before:bottom-1.5 before:left-1/2 before:h-1.5 before:w-1.5 before:-translate-x-1/2 before:rounded-full before:bg-[#0077B6]'
                  }}
                  className="w-full"
                />
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Fecha seleccionada</p>
                    <p className="font-semibold text-slate-900 capitalize">{formatDateLong(selectedDate)}</p>
                  </div>
                  <Badge className="bg-[#0077B6]/10 text-[#0077B6] border-[#0077B6]/20">
                    {selectedDayAppointments.length} cita{selectedDayAppointments.length === 1 ? '' : 's'}
                  </Badge>
                </div>
                <Button onClick={() => setSelectedDate(getMexicoDate())} variant="outline" className="w-full border-slate-200 bg-white">
                  Ir a hoy
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg capitalize text-slate-900">{formatDateLong(selectedDate)}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="w-8 h-8 text-[#0077B6] animate-spin" />
                </div>
              ) : selectedDayAppointments.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="font-medium text-slate-700">No hay citas programadas para este día</p>
                  <p className="text-sm mt-1">Selecciona otra fecha en el calendario para revisar tus citas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {selectedDayAppointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                          'rounded-2xl border p-4 transition-all cursor-pointer hover:shadow-md',
                          selectedAppointment?.id === appointment.id
                            ? 'border-[#0077B6] bg-[#0077B6]/5 shadow-sm'
                            : 'border-slate-200 bg-white'
                        )}
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="min-w-[72px] rounded-2xl bg-sky-50 px-3 py-3 text-center border border-sky-100">
                              <Clock className="w-5 h-5 text-[#0077B6] mx-auto mb-1" />
                              <span className="font-bold text-lg text-slate-900">{appointment.time}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-900 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                {appointment.patientName}
                              </div>
                              <div className="text-sm text-slate-500 flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {appointment.patientPhone}
                              </div>
                              <div className="text-sm text-slate-600 flex items-center gap-2">
                                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                                {appointment.treatment}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-start md:self-center">
                            <Badge className={statusColors[appointment.status] || statusColors.confirmed}>
                              {statusLabels[appointment.status] || appointment.status}
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
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-[#0077B6] to-[#00a8e8] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-heading font-bold">Detalle de Cita</h3>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedAppointment(null)} className="text-white/80 hover:text-white hover:bg-white/10">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#0077B6]" />
                    <div>
                      <div className="font-semibold text-slate-900">{selectedAppointment.time} - {formatDateLong(selectedAppointment.date)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#0077B6]" />
                    <div className="font-semibold text-slate-900">{selectedAppointment.patientName}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#0077B6]" />
                    <a href={`tel:${selectedAppointment.patientPhone}`} className="text-[#0077B6] hover:underline">
                      {selectedAppointment.patientPhone}
                    </a>
                  </div>

                  {selectedAppointment.patientEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#0077B6]" />
                      <a href={`mailto:${selectedAppointment.patientEmail}`} className="text-[#0077B6] hover:underline">
                        {selectedAppointment.patientEmail}
                      </a>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="text-sm text-slate-500 mb-1">Tratamiento</div>
                    <div className="font-medium text-slate-900">{selectedAppointment.treatment || 'Valoración inicial'}</div>
                  </div>

                  {selectedAppointment.notes && (
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Notas</div>
                      <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 border border-slate-200">
                        {selectedAppointment.notes}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Estado:</span>
                    <Badge className={statusColors[selectedAppointment.status] || statusColors.confirmed}>
                      {statusLabels[selectedAppointment.status] || selectedAppointment.status}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-4 flex-wrap">
                    <a
                      href={getPatientWhatsAppLink(selectedAppointment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[140px] bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>

                    {selectedAppointment.status !== 'confirmed' && (
                      <Button onClick={() => updateStatus(selectedAppointment.id, 'confirmed')} className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700">
                        <Check className="w-4 h-4 mr-2" />
                        Confirmar
                      </Button>
                    )}
                    {selectedAppointment.status !== 'completed' && (
                      <Button onClick={() => updateStatus(selectedAppointment.id, 'completed')} variant="outline" className="flex-1 min-w-[140px] border-slate-200">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completada
                      </Button>
                    )}
                    <Button onClick={() => cancelAppointment(selectedAppointment.id)} variant="destructive">
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
