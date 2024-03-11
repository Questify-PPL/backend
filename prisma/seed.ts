import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: {
      email: 'admin@questify.com',
    },
    update: {
      roles: ['ADMIN'],
      firstName: 'Admin',
      lastName: 'Questify Updated',
      isVerified: true,
    },
    create: {
      email: 'admin@questify.com',
      firstName: 'Admin',
      lastName: 'Questify',
      password: '$2a$10$RErow0.VS.4ZKWF9hpvooerm/SKYDyOIqMTLGqQP/0QR6xtOLykPC', // admin
      roles: ['ADMIN'],
      isVerified: true,
    },
  });

  const respondent = await prisma.user.upsert({
    where: {
      email: 'respondent@questify.com',
    },
    update: {
      roles: ['RESPONDENT'],
      firstName: 'Respondent',
      lastName: 'Questify Updated',
      isVerified: true,
    },
    create: {
      email: 'respondent@questify.com',
      firstName: 'Respondent',
      lastName: 'Questify',
      password: '$2a$10$7G2CywZZcq5RpKM0AUNRB./Uh/0DDLippdmns3wgQYfis4g4yjitW', // respondent
      roles: ['RESPONDENT'],
      isVerified: true,
    },
  });

  await prisma.respondent.upsert({
    where: {
      userId: respondent.id,
    },
    create: {
      userId: respondent.id,
    },
    update: {},
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
