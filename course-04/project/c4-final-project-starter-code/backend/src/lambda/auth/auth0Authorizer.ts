import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = `https://dev-46nx7vs6.eu.auth0.com/.well-known/jwks.json`
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJZUB6SPeSqVQkMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi00Nm54N3ZzNi5ldS5hdXRoMC5jb20wHhcNMjEwMTE2MDk0MTUyWhcN
MzQwOTI1MDk0MTUyWjAkMSIwIAYDVQQDExlkZXYtNDZueDd2czYuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1kSsNv6u/7iINEzy
8UkndvYiap1WDR2KEcDrvDTy2CEzy8aOP6wjbq0uHJVaz2QTsyXkYMRhV5rzThlH
6ubHAl1pZsFWl4YdsnZUqK1gprAXIY2YSyufzH3075Yg17q0zFtnUkGp4Jv8o5xt
2Xk6E71G2vyuriRqOi1f+XJP7L2N9RJIgfGZgfrgHHny+iM1lX30/LpKGMjPpy2y
XxCqB5cXH8DBaBdFEeGMqNSz2biJxXLDtPQM7c6PjWsq/W1JJbsdcrkMFuEttgO/
wrqdpb2vLB0H1iRB4jafFfgsCazE2Vvfb9Ogn08hQaNneIWWIWptzTrZtBQ5kPsE
wefBGQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS46cpdxU0J
/Q7J1LzIY4h/JK8NIjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AIDEKiUomGeEkH1ZK6qIKI1YhL7Xe58dV+Qte0FyXBzaynQegmeJ58KOPoiDexOO
Lx+RYLoXQVaZ6h7WmJ0VNe/+B6Y5fjwUW5ySoVgK4P8PXDgEWpYJd9R/lTMrY/m1
+U9gwYWmgOWPNqPJLQkV5zwHNXLGAF/v+oKdsbWvMTIaKDr0nqMGnRQKHWMtXqUN
cYqJRVfB0k6C5kePZjImP0BCvwZoj7pclekDThmCq5oe3QrSjwL2zuI3NqASl2XI
T8WDyLFfsAkxIqhK+E06bUgikPAyGX9CzpM0nx6wb+IvJtE1f9nrSrzGAZgGydKS
bjKlWIlZs0J/g0jpSdat91Y=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info(`Authorizing a user`, {token: event.authorizationToken})

  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info(`User was authorized`, {...jwtToken})

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
