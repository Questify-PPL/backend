import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Staging!';
  }

  sendGoodbye(): string {
    return 'Goodbye Staging!';
  }
}
