import { User } from '@prisma/client';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  /** Display role expected by the frontend: 'Admin' | 'Founder' | 'Investor' */
  role: string;
  company: string | null;
  avatar: string | null;
  balance: string | null;
  dealsClosed: number;
  createdAt: Date;
}

/** DB role enum (ADMIN/FOUNDER/SHARK) -> display role the frontend already understands. */
export function toDisplayRole(role: string): 'Admin' | 'Founder' | 'Investor' {
  if (role === 'ADMIN') return 'Admin';
  if (role === 'FOUNDER') return 'Founder';
  return 'Investor';
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: toDisplayRole(user.role),
    company: user.company,
    avatar: user.avatar,
    balance: user.balance,
    dealsClosed: user.dealsClosed,
    createdAt: user.createdAt,
  };
}
