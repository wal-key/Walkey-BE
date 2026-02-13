import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

export const issueJWT = (
  data = {},
  issuer = 'walkey',
  expiresIn = ONE_WEEK
) => {
  const token = jwt.sign(
    {
      ...data,
    },
    JWT_SECRET,
    {
      issuer,
      expiresIn,
    }
  );
  return token;
};
