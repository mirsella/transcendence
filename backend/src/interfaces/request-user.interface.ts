import { Request } from 'express';
import { User } from '../generated/prisma/client';

export interface IRequestUser extends Request {
  user: User;
}
