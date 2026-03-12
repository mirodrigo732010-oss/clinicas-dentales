import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario admin por defecto
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

  // Crear disponibilidad del doctor (horarios predeterminados)
  // Horario: Mañana 9:00-14:00, Tarde 16:00-20:00
  // Por lo tanto, horario completo: 09:00-20:00
  const defaultAvailability = [
    { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isActive: false }, // Domingo - Cerrado
    { dayOfWeek: 1, startTime: '09:00', endTime: '20:00', isActive: true },  // Lunes
    { dayOfWeek: 2, startTime: '09:00', endTime: '20:00', isActive: true },  // Martes
    { dayOfWeek: 3, startTime: '09:00', endTime: '20:00', isActive: true },  // Miércoles
    { dayOfWeek: 4, startTime: '09:00', endTime: '20:00', isActive: true },  // Jueves
    { dayOfWeek: 5, startTime: '09:00', endTime: '20:00', isActive: true },  // Viernes
    { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isActive: true },  // Sábado (solo mañana)
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
  console.log('✅ Disponibilidad del doctor creada');

  // Crear FAQs predeterminadas
  const existingFaqs = await prisma.fAQ.count();
  
  if (existingFaqs === 0) {
    const defaultFaqs = [
      { question: '¿Cuáles son los horarios de atención?', answer: 'Atendemos de lunes a viernes de 9:00 AM a 6:00 PM y sábados de 9:00 AM a 2:00 PM.', category: 'general', order: 1 },
      { question: '¿Aceptan seguros dentales?', answer: 'Sí, aceptamos la mayoría de seguros dentales. Por favor traiga su tarjeta de seguro a su cita.', category: 'pagos', order: 2 },
      { question: '¿Qué debo hacer en caso de emergencia dental?', answer: 'Llámenos inmediatamente. Ofrecemos servicio de emergencias las 24 horas para pacientes registrados.', category: 'emergencias', order: 3 },
      { question: '¿Con cuánta anticipación debo programar mi cita?', answer: 'Recomendamos programar con al menos una semana de anticipación para tratamientos regulares.', category: 'citas', order: 4 },
      { question: '¿Ofrecen planes de financiamiento?', answer: 'Sí, ofrecemos planes de pago flexibles y financiamiento sin intereses para tratamientos mayores.', category: 'pagos', order: 5 },
      { question: '¿Qué tratamientos ofrecen?', answer: 'Ofrecemos limpieza dental, blanqueamiento, implantes, ortodoncia, endodoncia, periodoncia y cirugía oral.', category: 'tratamientos', order: 6 },
      { question: '¿Es doloroso el tratamiento de conducto?', answer: 'Con la anestesia moderna y nuestras técnicas avanzadas, el procedimiento es prácticamente indoloro.', category: 'tratamientos', order: 7 },
      { question: '¿Cuánto tiempo dura el blanqueamiento dental?', answer: 'Los resultados pueden durar de 1 a 3 años, dependiendo de sus hábitos alimenticios y cuidado dental.', category: 'tratamientos', order: 8 },
    ];

    for (const faq of defaultFaqs) {
      await prisma.fAQ.create({
        data: faq,
      });
    }
    console.log('✅ FAQs creadas');
  } else {
    console.log('ℹ️ Ya existen FAQs, omitiendo...');
  }

  // Crear prompt principal de Elena
  const existingPrompt = await prisma.prompt.findFirst({
    where: { name: 'elena-main' }
  });

  if (!existingPrompt) {
    await prisma.prompt.create({
      data: {
        name: 'elena-main',
        content: `Eres Elena, la asistente virtual amable y profesional de la Clínica Dental Sonrisa Perfecta en la Ciudad de México.

INFORMACIÓN DE LA CLÍNICA:
- Nombre: Clínica Dental Sonrisa Perfecta
- Dirección: Av. Reforma 123, Col. Centro, Ciudad de México, CDMX
- Teléfono: +52 55 1234 5678
- WhatsApp del Doctor: +52 1 55 1748 9261
- Email: contacto@sonrisaperfecta.es

HORARIOS DE ATENCIÓN:
- Lunes a Viernes: 9:00 AM - 6:00 PM
- Sábados: 9:00 AM - 2:00 PM
- Domingos: Cerrado

TRATAMIENTOS Y PRECIOS:
- Limpieza dental: $800 MXN
- Blanqueamiento dental: $3,500 MXN
- Implante dental: $15,000 MXN
- Ortodoncia (brackets): Desde $25,000 MXN
- Ortodoncia invisible (Invisalign): Desde $45,000 MXN
- Endodoncia (tratamiento de conducto): $3,000 MXN
- Extracción dental: $600 MXN
- Resina (empaste estético): $800 MXN
- Corona dental: $5,000 MXN
- Diseño de sonrisa: Desde $20,000 MXN

REGLAS IMPORTANTES:
1. Saluda siempre de manera cálida y profesional en español de México
2. Para agendar citas, necesitas: nombre completo, teléfono, tratamiento de interés
3. Usa un tono cercano y empático, como una amiga que quiere ayudar
4. Si no sabes algo específico, ofrece conectar con el doctor por WhatsApp
5. Sé concisa pero completa en tus respuestas
6. SIEMPRE ofrece ayuda para agendar una cita cuando sea relevante
7. Si el paciente parece ansioso, sé especialmente comprensivo

ESTRUCTURA DE RESPUESTA:
- Máximo 2-3 oraciones por respuesta
- Usa emojis con moderación (máximo 1-2)
- Termina con una pregunta o oferta de ayuda cuando sea apropiado`,
        isActive: true,
      },
    });
    console.log('✅ Prompt de Elena creado');
  } else {
    console.log('ℹ️ Ya existe el prompt de Elena');
  }

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
