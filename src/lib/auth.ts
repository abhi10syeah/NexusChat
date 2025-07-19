import jwt from 'jsonwebtoken';

interface DecodedToken {
  user: {
    id: string;
    username: string;
  };
  iat: number;
  exp: number;
}

export function verifyToken(token: string | undefined): DecodedToken | null {
  if (!token) {
    return null;
  }
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
    return decoded;
  } catch (err) {
    return null;
  }
}
