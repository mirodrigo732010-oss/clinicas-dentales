import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario admin por defecto (contraseña simple para demo)
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@sonrisaperfecta.es' },
    update: {},
    create: {
      email: 'admin@sonrisaperfecta.es',
      passwordHash: 'admin123',
      name: 'Administrador',
      role: 'admin',
    },
  });
  console.log('✅ Admin creado:', admin.email);
  console.log('📝 Usuario: admin@sonrisaperfecta.es');
  console.log('📝 Contraseña: admin123');

  // Crear disponibilidad del doctor (horarios predeterminados)
  const defaultAvailability = [
    { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isActive: false }, // Domingo - Cerrado
    { dayOfWeek: 1, startTime: '09:00', endTime: '20:00', isActive: true },  // Lunes
    { dayOfWeek: 2, startTime: '09:00', endTime: '20:00', isActive: true },  // Martes
    { dayOfWeek: 3, startTime: '09:00', endTime: '20:00', isActive: true },  // Miércoles
    { dayOfWeek: 4, startTime: '09:00', endTime: '20:00', isActive: true },  // Jueves
    { dayOfWeek: 5, startTime: '09:00', endTime: '20:00', isActive: true },  // Viernes
    { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isActive: true },  // Sábado
  ];

  for (const avail of defaultAvailability) {
    const existing = await prisma.doctorAvailability.findFirst({
      where: { dayOfWeek: avail.dayOfWeek }
    });
    
    if (existing) {
      await prisma.doctorAvailability.update({
        where: { id: existing.id },
        data: avail,
      });
    } else {
      await prisma.doctorAvailability.create({
        data: avail,
      });
    }
  }
  console.log('✅ Horarios del doctor creados');

  // Crear configuración de recordatorios
  const existingReminderConfig = await prisma.reminderConfig.findFirst();
  if (!existingReminderConfig) {
    await prisma.reminderConfig.create({
      data: {
        name: 'Recordatorio de Cita',
        isActive: true,
        reminder24hEnabled: true,
        reminder2hEnabled: true,
        reminder1hEnabled: false,
        whatsappTemplate: '¡Hola {nombre}! Te recordamos tu cita en Clínica Dental Sonrisa Perfecta el {fecha} a las {hora} para {tratamiento}.',
        clinicPhone: '5517489261',
        clinicName: 'Clínica Dental Sonrisa Perfecta',
      },
    });
    console.log('✅ Configuración de recordatorios creada');
  }

  // Crear FAQs
  const existingFaqs = await prisma.fAQ.count();
  if (existingFaqs === 0) {
    const defaultFaqs = [
      { question: '¿Cuáles son los horarios?', answer: 'Lunes a viernes 9:00-20:00, Sábados 9:00-14:00', category: 'general', order: 1 },
      { question: '¿Qué tratamientos ofrecen?', answer: 'Limpieza, blanqueamiento, ortodoncia, implantes, endodoncia y más.', category: 'tratamientos', order: 2 },
    ];
    for (const faq of defaultFaqs) {
      await prisma.fAQ.create({ data: faq });
    }
    console.log('✅ FAQs creadas');
  }

  console.log('🎉 ¡Base de datos lista!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
