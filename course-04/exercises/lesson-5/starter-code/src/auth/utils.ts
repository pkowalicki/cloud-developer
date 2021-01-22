import { decode } from 'jsonwebtoken'

import { JwtToken } from './JwtToken'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function getUserId(token: string): string {
  const jwtToken: JwtToken = decode(token) as JwtToken
  return jwtToken.sub
}
