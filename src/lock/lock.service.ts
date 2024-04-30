import { Injectable } from '@nestjs/common';

@Injectable()
export class LockService {
  private locks: { [key: string]: boolean } = {};

  acquireLock(key: string): boolean {
    if (this.locks[key]) {
      return false;
    }
    this.locks[key] = true;
    return true;
  }

  releaseLock(key: string): void {
    delete this.locks[key];
  }
}
