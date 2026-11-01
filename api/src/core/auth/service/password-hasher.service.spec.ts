import { EnvService } from '../../../common/config/env.service';
import { PasswordHasherService } from './password-hasher.service';

describe('PasswordHasherService', () => {
  let service: PasswordHasherService;

  beforeAll(() => {
    const envService = {
      passwordArgon2MemoryCost: 19456,
      passwordArgon2TimeCost: 2,
      passwordArgon2Parallelism: 1,
    } as unknown as EnvService;

    service = new PasswordHasherService(envService);
  });

  it('hashes a password and verifies it', async () => {
    const hash = await service.hash('a-long-test-password');

    await expect(service.verify(hash, 'a-long-test-password')).resolves.toBe(
      true,
    );
    await expect(service.verify(hash, 'a-different-password')).resolves.toBe(
      false,
    );
  });

  it('checks an unknown account password against the dummy hash', async () => {
    await expect(
      service.verifyAgainstDummy('some-password'),
    ).resolves.toBe(false);
  });
});