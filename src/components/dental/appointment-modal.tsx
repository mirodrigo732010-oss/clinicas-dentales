'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, Loader2, AlertCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  treatment?: string;
}

const treatments = [
  'Valoración inicial (gratuita)',
  'Diseño de Sonrisa',
  'Ortodoncia Invisible',
  'Implantes Dentales',
  'Blanqueamiento Dental',
  'Limpieza Dental',
  'Otro tratamiento',
];

// WhatsApp del doctor
const WHATSAPP_NUMBER = '5215517489261';

export function AppointmentModal({ isOpen, onClose, treatment: initialTreatment }: AppointmentModalProps) {
  const [step, setStep] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{ 
    date: string; 
    time: string; 
    name: string; 
    phone: string; 
    treatment: string;
    whatsappSent: boolean;
  }>({ 
    date: '', 
    time: '', 
    name: '', 
    phone: '',
    treatment: '',
    whatsappSent: false
  });
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    treatment: initialTreatment || 'Valoración inicial (gratuita)',
    date: '',
    time: '',
    notes: '',
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Get minimum date using Mexico timezone (allow same day appointments)
  const getMexicoDate = useCallback(() => {
    const now = new Date();
    const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
    const year = mexicoTime.getFullYear();
    const month = String(mexicoTime.getMonth() + 1).padStart(2, '0');
    const day = String(mexicoTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [minDate, setMinDate] = useState(getMexicoDate());

  // Update minDate every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMinDate(getMexicoDate());
    }, 60000);
    return () => clearInterval(interval);
  }, [getMexicoDate]);

  // Get maximum date (3 months from now)
  const getMaxDate = useCallback(() => {
    const now = new Date();
    const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
    mexicoTime.setMonth(mexicoTime.getMonth() + 3);
    const year = mexicoTime.getFullYear();
    const month = String(mexicoTime.getMonth() + 1).padStart(2, '0');
    const day = String(mexicoTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const maxDateStr = getMaxDate();

  // Update treatment when prop changes
  useEffect(() => {
    if (initialTreatment) {
      setFormData(prev => ({ ...prev, treatment: initialTreatment }));
    }
  }, [initialTreatment]);

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.date) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const response = await fetch(`/api/calendar?date=${formData.date}`);
        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
        
        // Reset time if current selection is not available
        if (formData.time && !data.availableSlots?.includes(formData.time)) {
          setFormData(prev => ({ ...prev, time: '' }));
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [formData.date]);

  // Get current time in Mexico City
  const getCurrentTimeMexico = useCallback(() => {
    const now = new Date();
    const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
    return mexicoTime.getHours() * 60 + mexicoTime.getMinutes();
  }, []);

  // Filter slots that are still available today
  const getFilteredSlots = useCallback(() => {
    const isToday = formData.date === minDate;
    if (!isToday) return availableSlots;

    const currentMinutes = getCurrentTimeMexico();
    // Filter out past slots for today (with 1 hour buffer)
    return availableSlots.filter(slot => {
      const [hour, min] = slot.split(':').map(Number);
      const slotMinutes = hour * 60 + min;
      return slotMinutes > currentMinutes + 60;
    });
  }, [formData.date, minDate, availableSlots, getCurrentTimeMexico]);

  const filteredSlots = getFilteredSlots();

  // Generate WhatsApp message
  const generateWhatsAppMessage = (data: { name: string; phone: string; date: string; time: string; treatment: string }) => {
    // Format date for display
    const [year, month, day] = data.date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day, 12, 0, 0);
    const formattedDate = dateObj.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });

    return `🦷 *NUEVA CITA CONFIRMADA*

👤 *Paciente:* ${data.name}
📱 *Teléfono:* ${data.phone}
📅 *Fecha:* ${formattedDate}
🕐 *Hora:* ${data.time}
🦷 *Tratamiento:* ${data.treatment}

_Cita agendada desde la página web de Clínica Dental Sonrisa Perfecta_`;
  };

  const getWhatsAppLink = (data: { name: string; phone: string; date: string; time: string; treatment: string }) => {
    const message = generateWhatsAppMessage(data);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setError('');

    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Prepare success data
        const appointmentData = {
          date: formData.date, 
          time: formData.time,
          name: formData.name,
          phone: formData.phone,
          treatment: formData.treatment
        };

        // Auto-send WhatsApp notification
        const whatsappUrl = getWhatsAppLink(appointmentData);
        
        // Open WhatsApp in new tab automatically
        try {
          window.open(whatsappUrl, '_blank');
        } catch (e) {
          console.log('Could not auto-open WhatsApp:', e);
        }

        setSuccessData({ 
          ...appointmentData,
          whatsappSent: true
        });
        setStep('success');
      } else {
        setError(data.error || 'Error al agendar');
        setStep('error');
      }
    } catch (error) {
      setError('Error de conexión. Intenta de nuevo.');
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('form');
    setError('');
    setFormData({
      name: '',
      phone: '',
      email: '',
      treatment: 'Valoración inicial (gratuita)',
      date: '',
      time: '',
      notes: '',
    });
    setAvailableSlots([]);
    onClose();
  };

  // Group slots by period
  const morningSlots = filteredSlots.filter(t => t < '14:00');
  const afternoonSlots = filteredSlots.filter(t => t >= '16:00');

  // Format selected date for display
  const formatSelectedDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day, 12, 0, 0);
    return dateObj.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#0077B6] to-[#00a8e8] p-6 text-white flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading text-white flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Agendar Cita
            </DialogTitle>
            <p className="text-white/80 mt-2">
              Selecciona servicio, fecha y hora
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Service Selection - First */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    🦷 Servicio *
                  </Label>
                  <select
                    value={formData.treatment}
                    onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#0077B6] focus:ring-2 focus:ring-[#0077B6]/20 text-base"
                  >
                    {treatments.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#0077B6]" />
                    Fecha *
                  </Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
                    min={minDate}
                    max={maxDateStr}
                    required
                    className="border-gray-200 focus:border-[#0077B6]"
                  />
                  {formData.date === minDate && (
                    <p className="text-xs text-amber-600">
                      ⚠️ Para hoy solo se muestran horarios con al menos 1 hora de anticipación
                    </p>
                  )}
                  {formData.date && (
                    <p className="text-xs text-[#0077B6]">
                      📅 {formatSelectedDate(formData.date)}
                    </p>
                  )}
                </div>

                {/* Time Selection - Only show available slots */}
                {formData.date && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#0077B6]" />
                      Hora disponible *
                    </Label>
                    
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-[#0077B6] animate-spin" />
                      </div>
                    ) : filteredSlots.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                        <p>No hay horarios disponibles para esta fecha</p>
                        <p className="text-sm">Selecciona otra fecha</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {/* Morning slots */}
                        {morningSlots.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Mañana (9:00 - 14:00)</p>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                              {morningSlots.map((slot) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, time: slot })}
                                  className={cn(
                                    'py-2 px-2 rounded-lg text-sm font-medium transition-all',
                                    formData.time === slot
                                      ? 'bg-[#0077B6] text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  )}
                                >
                                  {slot}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Afternoon slots */}
                        {afternoonSlots.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Tarde (16:00 - 20:00)</p>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                              {afternoonSlots.map((slot) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, time: slot })}
                                  className={cn(
                                    'py-2 px-2 rounded-lg text-sm font-medium transition-all',
                                    formData.time === slot
                                      ? 'bg-[#0077B6] text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  )}
                                >
                                  {slot}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Patient Info */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#0077B6]" />
                    Nombre completo *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre"
                    required
                    className="border-gray-200 focus:border-[#0077B6]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#0077B6]" />
                    Teléfono (WhatsApp) *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+52 55 1234 5678"
                    required
                    className="border-gray-200 focus:border-[#0077B6]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0077B6]" />
                    Email (opcional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="border-gray-200 focus:border-[#0077B6]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!formData.date || !formData.time || !formData.name || !formData.phone}
                  className="w-full bg-[#0077B6] hover:bg-[#005a8c] text-white py-6 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Cita
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Al agendar aceptas nuestra política de privacidad.
                </p>
              </motion.form>
            )}

            {step === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader2 className="w-12 h-12 text-[#0077B6] animate-spin mb-4" />
                <p className="text-gray-600">Agendando tu cita...</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                  ¡Cita Confirmada!
                </h3>
                <p className="text-gray-600 mb-4">
                  Te esperamos el <strong>{formatSelectedDate(successData.date)}</strong> a las <strong>{successData.time}</strong>
                </p>

                <div className="bg-gray-50 rounded-lg p-4 w-full mb-4 text-left">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>👤 Paciente:</strong> {successData.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>📱 Teléfono:</strong> {successData.phone}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>📍 Ubicación:</strong> Av. Reforma 123, Col. Centro, CDMX
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>📞 Teléfono Clínica:</strong> +52 55 1234 5678
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>🦷 Tratamiento:</strong> {successData.treatment}
                  </p>
                </div>

                {/* WhatsApp notification info */}
                <div className="bg-green-50 rounded-lg p-4 w-full mb-4 text-left">
                  <p className="text-sm text-green-700">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Se abrió WhatsApp para notificar al doctor. Si no se abrió, usa el botón abajo.
                  </p>
                </div>

                {/* WhatsApp Button */}
                <a
                  href={getWhatsAppLink(successData)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-2 mb-3 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Reenviar por WhatsApp al Doctor
                </a>

                <Button onClick={handleClose} className="w-full bg-[#0077B6] hover:bg-[#005a8c] text-white">
                  Listo
                </Button>
              </motion.div>
            )}

            {step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                  Error
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => setStep('form')} variant="outline">
                  Intentar de nuevo
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
