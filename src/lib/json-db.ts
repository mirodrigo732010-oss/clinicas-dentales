// Base de datos JSON para entornos serverless (Netlify, Vercel)
// En producción, usar una base de datos externa como Supabase o Neon

import { promises as fs } from 'fs';
import path from 'path';

// Tipos
export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  date: string;
  time: string;
  treatment: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BlockedSlot {
  id: string;
  date: string;
  time: string;
  reason: string;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  category: string;
}

export interface Prompt {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  name: string;
}

interface Database {
  appointments: Appointment[];
  doctorAvailability: DoctorAvailability[];
  blockedSlots: BlockedSlot[];
  faqs: FAQ[];
  prompts: Prompt[];
  adminUsers: AdminUser[];
}

// Datos iniciales por defecto
const defaultData: Database = {
  appointments: [],
  doctorAvailability: [
    { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true },
    { id: '2', dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true },
    { id: '3', dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true },
    { id: '4', dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true },
    { id: '5', dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isActive: true },
    { id: '6', dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isActive: true },
    { id: '7', dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isActive: false },
  ],
  blockedSlots: [],
  faqs: [
    { id: '1', question: '¿Cuáles son los horarios de atención?', answer: 'Atendemos de lunes a viernes de 9:00 AM a 6:00 PM y sábados de 9:00 AM a 2:00 PM.', order: 1, isActive: true, category: 'general' },
    { id: '2', question: '¿Aceptan seguros dentales?', answer: 'Sí, aceptamos la mayoría de seguros dentales. Por favor traiga su tarjeta de seguro a su cita.', order: 2, isActive: true, category: 'pagos' },
    { id: '3', question: '¿Qué debo hacer en caso de emergencia dental?', answer: 'Llámenos inmediatamente. Ofrecemos servicio de emergencias las 24 horas para pacientes registrados.', order: 3, isActive: true, category: 'emergencias' },
    { id: '4', question: '¿Con cuánta anticipación debo programar mi cita?', answer: 'Recomendamos programar con al menos una semana de anticipación para tratamientos regulares.', order: 4, isActive: true, category: 'citas' },
    { id: '5', question: '¿Ofrecen planes de financiamiento?', answer: 'Sí, ofrecemos planes de pago flexibles y financiamiento sin intereses para tratamientos mayores.', order: 5, isActive: true, category: 'pagos' },
    { id: '6', question: '¿Qué tratamientos ofrecen?', answer: 'Ofrecemos limpieza dental, blanqueamiento, implantes, ortodoncia, endodoncia, periodoncia y cirugía oral.', order: 6, isActive: true, category: 'tratamientos' },
    { id: '7', question: '¿Es doloroso el tratamiento de conducto?', answer: 'Con la anestesia moderna y nuestras técnicas avanzadas, el procedimiento es prácticamente indoloro.', order: 7, isActive: true, category: 'tratamientos' },
    { id: '8', question: '¿Cuánto tiempo dura el blanqueamiento dental?', answer: 'Los resultados pueden durar de 1 a 3 años, dependiendo de sus hábitos alimenticios y cuidado dental.', order: 8, isActive: true, category: 'tratamientos' },
  ],
  prompts: [
    {
      id: 'elena-main',
      name: 'Elena - Asistente Principal',
      content: `Eres Elena, la asistente virtual amable y profesional de la Clínica Dental Sonrisa Perfecta. Tu rol es ayudar a los pacientes con:

1. Información sobre tratamientos dentales
2. Agendar citas
3. Responder preguntas frecuentes
4. Proporcionar precios y horarios

INFORMACIÓN DE LA CLÍNICA:
- Nombre: Clínica Dental Sonrisa Perfecta
- Dirección: Av. Reforma 123, Col. Centro, Ciudad de México
- Teléfono: +52 55 1234 5678
- WhatsApp: +52 1 55 1234 5678
- Email: contacto@sonrisaperfecta.es

HORARIOS:
- Lunes a Viernes: 9:00 AM - 6:00 PM
- Sábados: 9:00 AM - 2:00 PM
- Domingos: Cerrado

TRATAMIENTOS Y PRECIOS:
- Limpieza dental: $800 MXN
- Blanqueamiento: $3,500 MXN
- Implante dental: $15,000 MXN
- Ortodoncia (brackets): Desde $25,000 MXN
- Endodoncia: $3,000 MXN
- Extracción: $600 MXN
- Resina (empaste): $800 MXN

REGLAS IMPORTANTES:
- Siempre saluda de manera amable
- Para agendar citas, necesitas: nombre, teléfono, fecha y hora preferida
- Si no sabes algo, ofrece conectar con el doctor por WhatsApp
- Sé empática y profesional en todo momento
- Responde de forma concisa pero completa`,
      isActive: true
    }
  ],
  adminUsers: [
    { id: '1', email: 'admin@sonrisaperfecta.es', password: 'admin123', name: 'Administrador' }
  ]
};

// Almacenamiento en memoria (para serverless)
let memoryDb: Database | null = null;

// Función para obtener la ruta del archivo JSON
function getDbPath(): string {
  // En Netlify/Vercel, usar /tmp
  if (process.env.NETLIFY || process.env.VERCEL) {
    return path.join('/tmp', 'clinica-dental-db.json');
  }
  // En desarrollo, usar carpeta db
  return path.join(process.cwd(), 'db', 'json-db.json');
}

// Cargar base de datos
async function loadDb(): Promise<Database> {
  if (memoryDb) return memoryDb;
  
  try {
    const dbPath = getDbPath();
    
    // En serverless, intentar leer de /tmp primero
    if (process.env.NETLIFY || process.env.VERCEL) {
      try {
        const data = await fs.readFile(dbPath, 'utf-8');
        memoryDb = JSON.parse(data);
        return memoryDb!;
      } catch {
        // Si no existe, usar datos por defecto
        memoryDb = { ...defaultData };
        return memoryDb!;
      }
    }
    
    // En desarrollo, leer del archivo
    const data = await fs.readFile(dbPath, 'utf-8');
    memoryDb = JSON.parse(data);
    return memoryDb!;
  } catch {
    // Si hay error, usar datos por defecto
    memoryDb = { ...defaultData };
    return memoryDb!;
  }
}

// Guardar base de datos
async function saveDb(db: Database): Promise<void> {
  memoryDb = db;
  
  // En serverless, solo guardar en memoria
  if (process.env.NETLIFY || process.env.VERCEL) {
    return;
  }
  
  // En desarrollo, guardar en archivo
  try {
    const dbPath = getDbPath();
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Generar ID único
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================
// API DE CITAS
// ============================================

export const appointmentsDb = {
  async getAll(): Promise<Appointment[]> {
    const db = await loadDb();
    return db.appointments;
  },

  async getById(id: string): Promise<Appointment | null> {
    const db = await loadDb();
    return db.appointments.find(a => a.id === id) || null;
  },

  async getByDate(date: string): Promise<Appointment[]> {
    const db = await loadDb();
    return db.appointments.filter(a => a.date === date);
  },

  async create(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const db = await loadDb();
    const appointment: Appointment = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.appointments.push(appointment);
    await saveDb(db);
    return appointment;
  },

  async update(id: string, data: Partial<Appointment>): Promise<Appointment | null> {
    const db = await loadDb();
    const index = db.appointments.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    db.appointments[index] = {
      ...db.appointments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await saveDb(db);
    return db.appointments[index];
  },

  async delete(id: string): Promise<boolean> {
    const db = await loadDb();
    const index = db.appointments.findIndex(a => a.id === id);
    if (index === -1) return false;
    
    db.appointments.splice(index, 1);
    await saveDb(db);
    return true;
  }
};

// ============================================
// API DE DISPONIBILIDAD
// ============================================

export const availabilityDb = {
  async getAll(): Promise<DoctorAvailability[]> {
    const db = await loadDb();
    return db.doctorAvailability;
  },

  async update(id: string, data: Partial<DoctorAvailability>): Promise<DoctorAvailability | null> {
    const db = await loadDb();
    const index = db.doctorAvailability.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    db.doctorAvailability[index] = {
      ...db.doctorAvailability[index],
      ...data,
    };
    await saveDb(db);
    return db.doctorAvailability[index];
  },

  async getByDay(dayOfWeek: number): Promise<DoctorAvailability | null> {
    const db = await loadDb();
    return db.doctorAvailability.find(a => a.dayOfWeek === dayOfWeek && a.isActive) || null;
  }
};

// ============================================
// API DE SLOTS BLOQUEADOS
// ============================================

export const blockedSlotsDb = {
  async getAll(): Promise<BlockedSlot[]> {
    const db = await loadDb();
    return db.blockedSlots;
  },

  async getByDate(date: string): Promise<BlockedSlot[]> {
    const db = await loadDb();
    return db.blockedSlots.filter(s => s.date === date);
  },

  async create(data: Omit<BlockedSlot, 'id' | 'createdAt'>): Promise<BlockedSlot> {
    const db = await loadDb();
    const slot: BlockedSlot = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    db.blockedSlots.push(slot);
    await saveDb(db);
    return slot;
  },

  async delete(id: string): Promise<boolean> {
    const db = await loadDb();
    const index = db.blockedSlots.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    db.blockedSlots.splice(index, 1);
    await saveDb(db);
    return true;
  }
};

// ============================================
// API DE FAQs
// ============================================

export const faqsDb = {
  async getAll(): Promise<FAQ[]> {
    const db = await loadDb();
    return db.faqs.filter(f => f.isActive).sort((a, b) => a.order - b.order);
  },

  async getAllAdmin(): Promise<FAQ[]> {
    const db = await loadDb();
    return db.faqs.sort((a, b) => a.order - b.order);
  },

  async create(data: Omit<FAQ, 'id'>): Promise<FAQ> {
    const db = await loadDb();
    const faq: FAQ = {
      ...data,
      id: generateId(),
    };
    db.faqs.push(faq);
    await saveDb(db);
    return faq;
  },

  async update(id: string, data: Partial<FAQ>): Promise<FAQ | null> {
    const db = await loadDb();
    const index = db.faqs.findIndex(f => f.id === id);
    if (index === -1) return null;
    
    db.faqs[index] = { ...db.faqs[index], ...data };
    await saveDb(db);
    return db.faqs[index];
  },

  async delete(id: string): Promise<boolean> {
    const db = await loadDb();
    const index = db.faqs.findIndex(f => f.id === id);
    if (index === -1) return false;
    
    db.faqs.splice(index, 1);
    await saveDb(db);
    return true;
  }
};

// ============================================
// API DE PROMPTS
// ============================================

export const promptsDb = {
  async getAll(): Promise<Prompt[]> {
    const db = await loadDb();
    return db.prompts;
  },

  async getActive(): Promise<Prompt | null> {
    const db = await loadDb();
    return db.prompts.find(p => p.isActive) || null;
  },

  async update(id: string, data: Partial<Prompt>): Promise<Prompt | null> {
    const db = await loadDb();
    const index = db.prompts.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    // Si se activa este prompt, desactivar los demás
    if (data.isActive) {
      db.prompts.forEach(p => p.isActive = false);
    }
    
    db.prompts[index] = { ...db.prompts[index], ...data };
    await saveDb(db);
    return db.prompts[index];
  }
};

// ============================================
// API DE ADMIN
// ============================================

export const adminDb = {
  async login(email: string, password: string): Promise<AdminUser | null> {
    const db = await loadDb();
    const user = db.adminUsers.find(u => u.email === email && u.password === password);
    return user || null;
  },

  async getByEmail(email: string): Promise<AdminUser | null> {
    const db = await loadDb();
    return db.adminUsers.find(u => u.email === email) || null;
  }
};
