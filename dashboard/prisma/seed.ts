import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // Crear usuario admin por defecto
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@alfa.local' },
    update: {},
    create: {
      email: 'admin@alfa.local',
      name: 'Admin Alfa',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuario admin creado:', admin.email);

  // Crear proyecto de ejemplo
  const project = await prisma.project.create({
    data: {
      name: 'Proyecto Alfa Dashboard',
      description: 'Dashboard privado para gestionar proyectos con el agente Alfa',
      userId: admin.id,
    },
  });

  console.log('✅ Proyecto de ejemplo creado:', project.name);

  // Mensaje de bienvenida
  await prisma.message.create({
    data: {
      role: 'assistant',
      content: '🤖 ¡Bienvenido a Alfa Dashboard! Soy tu asistente experto en ciberseguridad, sistemas y software. ¿En qué puedo ayudarte hoy?',
      projectId: project.id,
      userId: admin.id,
    },
  });

  console.log('✅ Mensaje de bienvenida creado');
  console.log('🎉 Seed completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });