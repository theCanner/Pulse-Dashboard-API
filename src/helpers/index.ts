import crypto from 'crypto';
import bcrypt from 'bcrypt';

export const random = () => crypto.randomBytes(128).toString('base64');
export const authentication = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

export const buildId = (prefix: string, year: number, sequence: number) => {
  return `${prefix}-${year}-${sequence.toString().padStart(6, '0')}`;
};
