<p align="center">Questify</p>
    <p align="center">
<a href="https://gitlab.com/questify-ppl/backend/badges/main/coverage.svg?job=Test" target="_blank"><img src="https://gitlab.com/questify-ppl/backend/badges/main/coverage.svg?job=Test" alt="Coverage" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Prerequiste

1. Make sure to create .env file at the root of the folder.
2. Copy the content of .env.example, and set the appropriate value so that the app can run properly.
3. Firstly, run `npm run test` to make sure that the test has all been successfuly implemented to avoid unnecessary issue.
4. Secondly, run `npx prisma migrate dev && npx prisma generate` to your terminal.
5. Lastly, you can follow the instruction below to run the app.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
