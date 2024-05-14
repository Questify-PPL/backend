import { Form, PrismaClient, QuestionType, User } from '@prisma/client';

const prisma = new PrismaClient();
const totalAdmins = 1;
const totalRespondents = 3;
const totalCreators = 1;
const totalReport = Math.floor((totalCreators * totalRespondents) / 2);

async function main() {
  // Seed user data
  await createAdmins(totalAdmins);
  const respondents = await createRespondents(totalRespondents);
  const creators = await createCreators(totalCreators);

  // Seed shop data
  await createItems();
  await createVoucher(creators);

  // Seed form data
  const forms = await createForm(creators, respondents);
  await createParticipation(forms, respondents);

  // Seed report data
  await createReports(totalReport, forms, { respondents, creator: creators });
}

async function createVoucher(creators: User[]) {
  await prisma.voucher.upsert({
    where: {
      id: '1',
    },
    create: {
      id: '1',
      discount: 1000,
      expiredAt: new Date('2024-12-31'),
      userId: creators[0].id,
    },
    update: {
      isUsed: false,
      userId: creators[0].id,
    },
  });
}

async function createItems() {
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
}

async function createAdmins(n: number) {
  const admins = [];

  for (let i = 0; i < n; i++) {
    const admin = await prisma.user.upsert({
      where: {
        email: `admin${i}@questify.com`,
      },
      update: {
        roles: ['ADMIN'],
        firstName: `Admin ${i}`,
        lastName: 'Questify Updated',
        isVerified: true,
      },
      create: {
        email: `admin${i}@questify.com`,
        firstName: `Admin ${i}`,
        lastName: 'Questify',
        password:
          '$2a$10$RErow0.VS.4ZKWF9hpvooerm/SKYDyOIqMTLGqQP/0QR6xtOLykPC', // admin
        roles: ['ADMIN'],
        isVerified: true,
        hasCompletedProfile: true,
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

    await prisma.creator.upsert({
      where: {
        userId: admin.id,
      },
      create: {
        userId: admin.id,
      },
      update: {},
    });

    await prisma.admin.upsert({
      where: {
        userId: admin.id,
      },
      create: {
        userId: admin.id,
      },
      update: {},
    });

    admins.push(admin);
  }

  return admins;
}

async function createRespondents(n: number) {
  const respondents = [];

  for (let i = 0; i < n; i++) {
    const respondent = await prisma.user.upsert({
      where: {
        email: `respondent${i}@questify.com`,
      },
      update: {
        roles: ['RESPONDENT'],
        firstName: `Respondent ${i}`,
        lastName: 'Questify Updated',
        isVerified: true,
      },
      create: {
        email: `respondent${i}@questify.com`,
        firstName: `Respondent ${i}`,
        lastName: 'Questify',
        password:
          '$2a$10$7G2CywZZcq5RpKM0AUNRB./Uh/0DDLippdmns3wgQYfis4g4yjitW', // respondent
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

    respondents.push(respondent);
  }
  return respondents;
}

async function createCreators(n: number) {
  const creators = [];

  for (let i = 0; i < n; i++) {
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
        password:
          '$2a$10$Fc34lQ4jUY3e7/Z7ZJTf5eeOqISojt9zZHcJxprfwur6BYYQXeex6', // creator
        roles: ['CREATOR'],
        isVerified: true,
        credit: 10000000,
      },
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

    creators.push(creator);
  }

  return creators;
}

async function createForm(creators: User[], respondents: User[]) {
  if (
    !(await prisma.form.findFirst({
      where: {
        creatorId: creators[0].id,
        title: 'Oreo Official: Exploring Consumer Insights on Oreo Products',
      },
    }))
  ) {
    const sectionsToMake = [
      {
        sectionName: 'Opening',
        sectionDescription:
          'Hello! I’m Ruben. I’m a Scientist at Oreo. Through this questionnaire I’d like to know consumer’s preferences for Oreo flavors and packaging.',
        questions: [],
      },
      {
        sectionName: 'Oreo Special Edition Motivation',
        sectionDescription: "Let's talk about the Oreo Special Edition.",
        questions: [
          {
            question:
              'What motivated your purchase of the Oreo Special Edition?',
            questionTypeName: 'Short Text',
            questionType: 'TEXT',
            isRequired: true,
            description:
              'Please share what factors influenced your decision to buy the Oreo Special Edition, such as flavor, packaging, advertising, or other reasons',
            answer: [
              {
                respondentId: respondents[0].id,
                answer: {
                  answer:
                    'I bought the Oreo Special Edition because I saw an advertisement on Instagram that featured a new flavor I wanted to try. The packaging design also caught my eye, and I was curious about the limited edition release.',
                },
              },
              {
                respondentId: respondents[1].id,
                answer: {
                  answer:
                    'I purchased the Oreo Special Edition because I read positive reviews online about the new flavor. The packaging was also appealing, and I wanted to try the product for myself.',
                },
              },
              {
                respondentId: respondents[2].id,
                answer: {
                  answer:
                    'I decided to buy the Oreo Special Edition after receiving a recommendation from a friend. The unique flavor and packaging design were intriguing, and I wanted to experience it firsthand.',
                },
              },
            ],
          },
          {
            question:
              'How likely are you to recommend the Oreo Special Edition to a friend or family member?',
            questionTypeName: 'Radio',
            questionType: 'RADIO',
            isRequired: true,
            description:
              'On a scale of 1 to 10, with 1 being "Not Likely" and 10 being "Very Likely," how likely are you to recommend the Oreo Special Edition to someone you know?',
            choice: ['1', '2', '3', '4', '5'],
            answer: [
              {
                respondentId: respondents[0].id,
                answer: ['5'],
              },
              {
                respondentId: respondents[1].id,
                answer: ['4'],
              },
              {
                respondentId: respondents[2].id,
                answer: ['3'],
              },
            ],
          },
        ],
      },
      {
        sectionName: "Feedback on Oreo's Online Advertising Campaigns",
        sectionDescription:
          'Let’s talk about Oreo’s online advertising campaigns.',
        questions: [
          {
            question:
              "How frequently do you recall seeing Oreo's advertisements online?",
            questionTypeName: 'Short Text',
            questionType: 'TEXT',
            isRequired: true,
            description:
              "Consider the past month and indicate how often you encountered Oreo's online ads, whether on social media, websites, or video platforms.",
            answer: [
              {
                respondentId: respondents[0].id,
                answer: {
                  answer: 'I saw Oreo ads online about once a week.',
                },
              },
              {
                respondentId: respondents[1].id,
                answer: {
                  answer: 'I noticed Oreo ads online a few times a month.',
                },
              },
              {
                respondentId: respondents[2].id,
                answer: {
                  answer: 'I rarely saw Oreo ads online in the past month.',
                },
              },
            ],
          },
          {
            question:
              "Which element of Oreo's online advertisements caught your attention the most?",
            description:
              'Please describe the features (such as visual design, message, special offers, or product showcased) of the online ads that made the most significant impression on you.',
            questionTypeName: 'Long Text',
            questionType: 'TEXT',
            isRequired: true,
            answer: [
              {
                respondentId: respondents[0].id,
                answer: {
                  answer:
                    'The vibrant colors and playful animations in Oreo ads always grab my attention. The ads are visually appealing and make me want to learn more about the product.',
                },
              },
              {
                respondentId: respondents[1].id,
                answer: {
                  answer:
                    'I find the storytelling in Oreo ads to be captivating. The narratives are engaging and create an emotional connection with the audience.',
                },
              },
              {
                respondentId: respondents[2].id,
                answer: {
                  answer:
                    'The interactive elements in Oreo ads are what stand out to me. I enjoy participating in quizzes, games, and other activities that are part of the ad experience.',
                },
              },
            ],
          },
          {
            questionType: 'CHECKBOX',
            questionTypeName: 'Checkbox',
            isRequired: true,
            question:
              'Which of the following online platforms have you seen Oreo ads on?',
            description:
              'Please select all the online platforms where you have encountered Oreo advertisements.',
            choice: [
              'Facebook',
              'Instagram',
              'YouTube',
              'Twitter',
              'TikTok',
              'Snapchat',
            ],
            answer: [
              {
                respondentId: respondents[0].id,
                answer: ['Instagram', 'YouTube'],
              },
              {
                respondentId: respondents[1].id,
                answer: ['Facebook', 'Twitter'],
              },
              {
                respondentId: respondents[2].id,
                answer: ['TikTok', 'Snapchat'],
              },
            ],
          },
        ],
      },
      {
        sectionName: 'Preferences for Oreo Flavor Innovations',
        sectionDescription: 'Let’s talk about Oreo flavor innovations.',
        questions: [
          {
            questionType: 'TEXT',
            questionTypeName: 'Short Text',
            isRequired: true,
            question: 'Which new Oreo flavor would you be most excited to try?',
            description:
              'Considering potential future flavor innovations such as Matcha Green Tea, Salted Caramel, or Spicy Chili, please share which one appeals to you the most and why.',
            answer: [
              {
                respondentId: respondents[0].id,
                answer: {
                  answer:
                    'I would love to try the Salted Caramel Oreo flavor. The combination of sweet and salty flavors sounds delicious, and I think it would be a unique addition to the Oreo lineup.',
                },
              },
              {
                respondentId: respondents[1].id,
                answer: {
                  answer:
                    'I am most excited about the Spicy Chili Oreo flavor. I enjoy spicy foods and think the heat would complement the sweetness of the cookie.',
                },
              },
              {
                respondentId: respondents[2].id,
                answer: {
                  answer:
                    'Matcha Green Tea Oreo is the flavor I am looking forward to trying. I appreciate the earthy and slightly bitter taste of matcha, and I think it would make a great Oreo flavor.',
                },
              },
            ],
          },
          {
            questionType: 'RADIO',
            questionTypeName: 'Radio',
            isRequired: true,
            question: 'Which of the following Oreo flavors have you tried?',
            description:
              'Please select all the Oreo flavors you have tasted in the past.',
            choice: [
              'Original',
              'Double Stuf',
              'Golden',
              'Mint',
              'Peanut Butter',
            ],
            answer: [
              {
                respondentId: respondents[0].id,
                answer: ['Original'],
              },
              {
                respondentId: respondents[1].id,
                answer: ['Peanut Butter'],
              },
              {
                respondentId: respondents[2].id,
                answer: ['Original'],
              },
            ],
          },
        ],
      },
      {
        sectionName: 'Ending',
        sectionDescription:
          'Thank you for participating in this survey. Your feedback is valuable to us. We appreciate your time and insights.',
        questions: [],
      },
    ];

    const forms = [];

    const publishedForm = await prisma.form.create({
      data: {
        creatorId: creators[0].id,
        title: 'Oreo Official: Exploring Consumer Insights on Oreo Products',
        prize: 1000000,
        prizeType: 'EVEN',
        isPublished: true,
        Section: {
          create: sectionsToMake.map((section) => ({
            name: section.sectionName,
            description: section.sectionDescription,
            Question: {
              create: section.questions.map((question) => ({
                question: question.question,
                questionType: question.questionType as QuestionType,
                questionTypeName: question.questionTypeName,
                isRequired: question.isRequired,
                description: question.description,
                Answer: {
                  create: question.answer.map((answer) => {
                    return {
                      respondentId: answer.respondentId,
                      answer: answer.answer,
                    };
                  }),
                },
                ...(question.questionType === 'TEXT' && {
                  Text: {
                    create: {},
                  },
                }),
                ...(question.questionType === 'RADIO' && {
                  Radio: {
                    create: {
                      choice: question.choice,
                    },
                  },
                }),
                ...(question.questionType === 'CHECKBOX' && {
                  Checkbox: {
                    create: {
                      choice: question.choice,
                    },
                  },
                }),
              })),
            },
          })),
        },
      },
    });

    forms.push(publishedForm);

    return forms;
  }
}

async function createParticipation(forms: Form[], respondents: User[]) {
  const participations = respondents.map((respondent) => ({
    formId: forms[0].id,
    respondentId: respondent.id,
    questionsAnswered: 7,
    isCompleted: true,
    respondentIsReported: false,
  }));

  await prisma.participation.createMany({
    data: participations,
  });
}

async function createReports(
  n: number,
  forms: Form[],
  user: { respondents: User[]; creator: User[] },
) {
  const form = forms[0];

  for (let i = 0; i < n; i++) {
    await prisma.report.create({
      data: {
        formId: form.id,
        fromUserId: user.creator[0].id,
        toUserId: user.respondents[i].id,
        message: 'Inappropriate content',
      },
    });

    await prisma.participation.update({
      where: {
        respondentId_formId: {
          formId: form.id,
          respondentId: user.respondents[i].id,
        },
      },
      data: {
        respondentIsReported: true,
      },
    });
  }
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
