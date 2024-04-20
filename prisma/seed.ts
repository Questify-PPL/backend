import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
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
      hasCompletedProfile: true,
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

  const creator = await prisma.user.upsert({
    where: {
      email: 'creator@questify.com',
    },
    update: {
      roles: ['CREATOR'],
      firstName: 'Creator',
      lastName: 'Questify Updated',
      isVerified: true,
      credit: 10000000,
    },
    create: {
      email: 'creator@questify.com',
      firstName: 'Creator',
      lastName: 'Questify',
      password: '$2a$10$Fc34lQ4jUY3e7/Z7ZJTf5eeOqISojt9zZHcJxprfwur6BYYQXeex6', // creator
      roles: ['CREATOR'],
      isVerified: true,
      credit: 10000000,
    },
  });

  await prisma.respondent.upsert({
    where: {
      userId: admin.id,
    },
    create: {
      userId: admin.id,
    },
    update: {},
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

  await prisma.creator.upsert({
    where: {
      userId: admin.id,
    },
    create: {
      userId: admin.id,
    },
    update: {},
  });

  await prisma.creator.upsert({
    where: {
      userId: creator.id,
    },
    create: {
      userId: creator.id,
    },
    update: {},
  });

  const itemsCount = await prisma.item.count();

  if (itemsCount == 0) {
    await prisma.item.createMany({
      data: [
        {
          title: '1 Form',
          price: 25000,
          description: 'Get 1 Form',
          advertisedOriginalPrice: 27000,
          emptyForms: 1,
        },
        {
          title: '3 Forms',
          price: 70000,
          description: 'Get 3 Forms',
          advertisedOriginalPrice: 81000,
          emptyForms: 3,
        },
        {
          title: '5 Forms',
          price: 110000,
          description: 'Get 5 Forms',
          advertisedOriginalPrice: 135000,
          emptyForms: 5,
        },
        {
          title: '10 Forms',
          price: 200000,
          description: 'Get 10 Forms',
          advertisedOriginalPrice: 270000,
          emptyForms: 10,
        },
      ],
    });
  }

  await prisma.voucher.upsert({
    where: {
      id: '1',
    },
    create: {
      id: '1',
      discount: 1000,
      expiredAt: new Date('2024-12-31'),
      userId: creator.id,
    },
    update: {
      isUsed: false,
      userId: creator.id,
    },
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
