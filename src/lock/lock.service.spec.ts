import { Test, TestingModule } from '@nestjs/testing';
import { LockService } from './lock.service';

describe('LockService', () => {
  let service: LockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LockService],
    }).compile();

    service = module.get<LockService>(LockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('acquireLock', () => {
    it('should return true when the lock is successfully acquired', () => {
      const key = 'testKey';

      const result = service.acquireLock(key);

      expect(result).toBe(true);
    });

    it('should return false when trying to acquire an already acquired lock', () => {
      const key = 'testKey';

      service.acquireLock(key);
      const result = service.acquireLock(key);

      expect(result).toBe(false);
    });
  });

  describe('releaseLock', () => {
    it('should release the lock for the given key', () => {
      const key = 'testKey';

      service.acquireLock(key);
      service.releaseLock(key);
      const result = service.acquireLock(key);

      expect(result).toBe(true);
    });

    it('should not throw an error when releasing a non-existing lock', () => {
      const key = 'nonExistingKey';

      expect(() => service.releaseLock(key)).not.toThrow();
    });
  });
});
