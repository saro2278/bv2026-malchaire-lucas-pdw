import { normalizeEmail } from './normalize-email.util';

describe('normalizeEmail', () => {
  it('removes spaces at the beginning and the end', () => {
    expect(normalizeEmail('  user@example.com  ')).toBe('user@example.com');
  });

  it('converts the address to lowercase', () => {
    expect(normalizeEmail('User@Example.COM')).toBe('user@example.com');
  });

  it('trims spaces and converts the address to lowercase', () => {
    expect(normalizeEmail('  User@Example.COM  ')).toBe('user@example.com');
  });
});