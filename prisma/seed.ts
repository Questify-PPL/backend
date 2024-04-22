import { PrismaClient, QuestionType } from '@prisma/client';

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

  const respondent2 = await prisma.user.upsert({
    where: {
      email: 'respondent2@questify.com',
    },
    update: {
      roles: ['RESPONDENT'],
      firstName: 'Respondent',
      lastName: 'Questify 2 Updated',
      isVerified: true,
    },
    create: {
      email: 'respondent2@questify.com',
      firstName: 'Respondent',
      lastName: 'Questify 2',
      password: '$2a$10$7G2CywZZcq5RpKM0AUNRB./Uh/0DDLippdmns3wgQYfis4g4yjitW', // respondent
      roles: ['RESPONDENT'],
      isVerified: true,
    },
  });

  const respondent3 = await prisma.user.upsert({
    where: {
      email: 'respondent3@questify.com',
    },
    update: {
      roles: ['RESPONDENT'],
      firstName: 'Respondent',
      lastName: 'Questify 3 Updated',
      isVerified: true,
    },
    create: {
      email: 'respondent3@questify.com',
      firstName: 'Respondent',
      lastName: 'Questify 3',
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

  await prisma.respondent.upsert({
    where: {
      userId: respondent2.id,
    },
    create: {
      userId: respondent2.id,
    },
    update: {},
  });

  await prisma.respondent.upsert({
    where: {
      userId: respondent3.id,
    },
    create: {
      userId: respondent3.id,
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

  if (
    !(await prisma.form.findFirst({
      where: {
        creatorId: creator.id,
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
                respondentId: respondent.id,
                answer: {
                  answer:
                    'I bought the Oreo Special Edition because I saw an advertisement on Instagram that featured a new flavor I wanted to try. The packaging design also caught my eye, and I was curious about the limited edition release.',
                },
              },
              {
                respondentId: respondent2.id,
                answer: {
                  answer:
                    'I purchased the Oreo Special Edition because I read positive reviews online about the new flavor. The packaging was also appealing, and I wanted to try the product for myself.',
                },
              },
              {
                respondentId: respondent3.id,
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
                respondentId: respondent.id,
                answer: ['5'],
              },
              {
                respondentId: respondent2.id,
                answer: ['4'],
              },
              {
                respondentId: respondent3.id,
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
                respondentId: respondent.id,
                answer: {
                  answer: 'I saw Oreo ads online about once a week.',
                },
              },
              {
                respondentId: respondent2.id,
                answer: {
                  answer: 'I noticed Oreo ads online a few times a month.',
                },
              },
              {
                respondentId: respondent3.id,
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
                respondentId: respondent.id,
                answer: {
                  answer:
                    'The vibrant colors and playful animations in Oreo ads always grab my attention. The ads are visually appealing and make me want to learn more about the product.',
                },
              },
              {
                respondentId: respondent2.id,
                answer: {
                  answer:
                    'I find the storytelling in Oreo ads to be captivating. The narratives are engaging and create an emotional connection with the audience.',
                },
              },
              {
                respondentId: respondent3.id,
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
                respondentId: respondent.id,
                answer: ['Instagram', 'YouTube'],
              },
              {
                respondentId: respondent2.id,
                answer: ['Facebook', 'Twitter'],
              },
              {
                respondentId: respondent3.id,
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
                respondentId: respondent.id,
                answer: {
                  answer:
                    'I would love to try the Salted Caramel Oreo flavor. The combination of sweet and salty flavors sounds delicious, and I think it would be a unique addition to the Oreo lineup.',
                },
              },
              {
                respondentId: respondent2.id,
                answer: {
                  answer:
                    'I am most excited about the Spicy Chili Oreo flavor. I enjoy spicy foods and think the heat would complement the sweetness of the cookie.',
                },
              },
              {
                respondentId: respondent3.id,
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
                respondentId: respondent.id,
                answer: ['Original'],
              },
              {
                respondentId: respondent2.id,
                answer: ['Peanut Butter'],
              },
              {
                respondentId: respondent3.id,
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

    const publishedForm = await prisma.form.create({
      data: {
        creatorId: creator.id,
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

    await prisma.participation.createMany({
      data: [
        {
          formId: publishedForm.id,
          respondentId: respondent.id,
          questionsAnswered: 7,
          isCompleted: true,
        },
        {
          formId: publishedForm.id,
          respondentId: respondent2.id,
          questionsAnswered: 7,
          isCompleted: true,
        },
        {
          formId: publishedForm.id,
          respondentId: respondent3.id,
          questionsAnswered: 7,
          isCompleted: true,
        },
      ],
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
