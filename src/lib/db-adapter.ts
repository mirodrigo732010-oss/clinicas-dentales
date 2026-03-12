// Adaptador de base de datos SQLite para VPS/EasyPanel
import { db } from './db';

// Helper para obtener la fecha actual en zona horaria de México
export function getMexicoDate(): string {
  const now = new Date();
  const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
  const year = mexicoTime.getFullYear();
  const month = String(mexicoTime.getMonth() + 1).padStart(2, '0');
  const day = String(mexicoTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMexicoTime(): string {
  const now = new Date();
  const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
  const hours = String(mexicoTime.getHours()).padStart(2, '0');
  const minutes = String(mexicoTime.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Obtener día de la semana de manera correcta (sin problemas de zona horaria)
export function getDayOfWeekFromDate(dateStr: string): number {
  // dateStr formato: YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number);
  // Crear fecha a mediodía para evitar problemas de zona horaria
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return date.getDay(); // 0 = Domingo, 1 = Lunes, etc.
}

// API para citas
export const appointmentsApi = {
  async getAll() {
    return db.appointment.findMany({
      orderBy: { date: 'asc' }
    });
  },

  async getByDate(date: string) {
    return db.appointment.findMany({
      where: { date }
    });
  },

  async create(data: {
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    date: string;
    time: string;
    treatment?: string;
    status?: string;
    notes?: string;
  }) {
    return db.appointment.create({
      data: {
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        patientEmail: data.patientEmail || null,
        date: data.date,
        time: data.time,
        treatment: data.treatment || 'Valoración inicial',
        status: data.status || 'confirmed',
        notes: data.notes || null,
      }
    });
  },

  async update(id: string, data: Record<string, unknown>) {
    return db.appointment.update({
      where: { id },
      data
    });
  },

  async delete(id: string) {
    return db.appointment.delete({
      where: { id }
    });
  }
};

// API para disponibilidad del doctor
export const availabilityApi = {
  async getAll() {
    return db.doctorAvailability.findMany({
      orderBy: { dayOfWeek: 'asc' }
    });
  },

  async getByDay(dayOfWeek: number) {
    return db.doctorAvailability.findUnique({
      where: { dayOfWeek }
    });
  },

  async upsert(data: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }) {
    return db.doctorAvailability.upsert({
      where: { dayOfWeek: data.dayOfWeek },
      update: data,
      create: data
    });
  }
};

// API para slots bloqueados
export const blockedSlotsApi = {
  async getAll() {
    return db.blockedSlot.findMany({
      orderBy: [{ date: 'asc' }, { time: 'asc' }]
    });
  },

  async getByDate(date: string) {
    return db.blockedSlot.findMany({
      where: { date }
    });
  },

  async create(data: { date: string; time: string; reason?: string }) {
    return db.blockedSlot.create({
      data: {
        date: data.date,
        time: data.time,
        reason: data.reason || 'Bloqueado por el doctor',
      }
    });
  },

  async delete(id: string) {
    return db.blockedSlot.delete({
      where: { id }
    });
  }
};

// API para FAQs
export const faqsApi = {
  async getPublic() {
    return db.fAQ.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
  },

  async getAll() {
    return db.fAQ.findMany({
      orderBy: { order: 'asc' }
    });
  },

  async create(data: { question: string; answer: string; order?: number; isActive?: boolean; category?: string }) {
    return db.fAQ.create({
      data: {
        question: data.question,
        answer: data.answer,
        order: data.order || 0,
        isActive: data.isActive !== false,
        category: data.category || 'general',
      }
    });
  },

  async update(id: string, data: Record<string, unknown>) {
    return db.fAQ.update({
      where: { id },
      data
    });
  },

  async delete(id: string) {
    return db.fAQ.delete({
      where: { id }
    });
  }
};

// API para prompts de Elena
export const promptsApi = {
  async getActive() {
    return db.prompt.findFirst({
      where: { isActive: true }
    });
  },

  async getAll() {
    return db.prompt.findMany();
  },

  async getByName(name: string) {
    return db.prompt.findFirst({
      where: { name }
    });
  },

  async update(id: string, data: { content?: string; isActive?: boolean }) {
    // Si se activa este prompt, desactivar los demás
    if (data.isActive) {
      await db.prompt.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }
    return db.prompt.update({
      where: { id },
      data
    });
  },

  async upsert(data: { name: string; content: string; isActive?: boolean }) {
    return db.prompt.upsert({
      where: { name: data.name },
      update: data,
      create: data
    });
  }
};

// API para admin
export const adminApi = {
  async login(email: string, password: string) {
    return db.adminUser.findFirst({
      where: { email, passwordHash: password }
    });
  },

  async getByEmail(email: string) {
    return db.adminUser.findFirst({
      where: { email }
    });
  },

  async create(data: { email: string; passwordHash: string; name: string }) {
    return db.adminUser.create({
      data
    });
  },

  async updateLastLogin(id: string) {
    return db.adminUser.update({
      where: { id },
      data: { lastLogin: new Date() }
    });
  }
};

// API para conversaciones
export const conversationsApi = {
  async get(sessionId: string) {
    const conv = await db.conversation.findUnique({
      where: { sessionId }
    });
    if (conv) {
      return JSON.parse(conv.messages);
    }
    return null;
  },

  async save(sessionId: string, messages: Array<{ role: string; content: string }>) {
    return db.conversation.upsert({
      where: { sessionId },
      update: { messages: JSON.stringify(messages) },
      create: { sessionId, messages: JSON.stringify(messages) }
    });
  }
};

// Función para verificar disponibilidad
export async function checkAvailability(date: string, time: string): Promise<boolean> {
  // Verificar si hay una cita existente
  const appointment = await db.appointment.findFirst({
    where: {
      date,
      time,
      status: { not: 'cancelled' }
    }
  });

  if (appointment) return false;

  // Verificar si el slot está bloqueado
  const blockedSlot = await db.blockedSlot.findFirst({
    where: { date, time }
  });

  if (blockedSlot) return false;

  // Verificar horario del doctor usando nuestra función de día de la semana
  const dayOfWeek = getDayOfWeekFromDate(date);

  const availability = await db.doctorAvailability.findUnique({
    where: { dayOfWeek }
  });

  if (!availability || !availability.isActive) return false;

  // Verificar que la hora esté dentro del horario
  const [startHour, startMin] = availability.startTime.split(':').map(Number);
  const [endHour, endMin] = availability.endTime.split(':').map(Number);
  const [timeHour, timeMin] = time.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const timeMinutes = timeHour * 60 + timeMin;

  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

// Función para obtener slots disponibles
export async function getAvailableSlots(date: string): Promise<string[]> {
  // Usar nuestra función correcta para obtener día de la semana
  const dayOfWeek = getDayOfWeekFromDate(date);

  const availability = await db.doctorAvailability.findUnique({
    where: { dayOfWeek }
  });

  console.log(`📅 Checking slots for ${date} (dayOfWeek: ${dayOfWeek}), availability:`, availability);

  if (!availability || !availability.isActive) {
    console.log(`❌ No availability for day ${dayOfWeek}`);
    return [];
  }

  const [startHour, startMin] = availability.startTime.split(':').map(Number);
  const [endHour, endMin] = availability.endTime.split(':').map(Number);

  const slots: string[] = [];
  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour * 60 + currentMin < endHour * 60 + endMin) {
    const time = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

    if (await checkAvailability(date, time)) {
      slots.push(time);
    }

    // Incrementar en 30 minutos
    currentMin += 30;
    if (currentMin >= 60) {
      currentHour++;
      currentMin -= 60;
    }
  }

  console.log(`✅ Available slots for ${date}:`, slots);
  return slots;
}
