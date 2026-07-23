export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
  company?: string | null;
}

export interface RefreshTokenPayload {
  sub: string;
}
