import { decode } from 'jsonwebtoken'
import { createLogger } from '../utils/logger'

import { JwtToken } from './JwtToken'

const logger = createLogger('utils-auth-parse-user')
/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtToken
  logger.info(`Decoded JWT ${JSON.stringify(decodedJwt)}`, {decodedJwt: JSON.stringify(decodedJwt)})
  return decodedJwt.sub
}
