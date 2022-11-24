import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJQDXZZTYfYodvMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1qMTE0c3Rkb2x6aHlsbnYxLnVrLmF1dGgwLmNvbTAeFw0yMjExMTYw
MTQ1MDJaFw0zNjA3MjUwMTQ1MDJaMCwxKjAoBgNVBAMTIWRldi1qMTE0c3Rkb2x6
aHlsbnYxLnVrLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBANPGL1UH4zZpW+YuHrPMgRulgBiPC12hfszyL8lJN3CvEL3DcaUcY64NvamS
ELJJuyv7Q8lsp2wj6HOY+7wPxXyKgBdiKmuqnN+axqkZxpiui7fGg5SKMT/BEMml
s3hCcrbAxK8Z4SrBSpWVfv9qXxjlT96iGiI/Q7UVK3XDRtD4mHYunVzog3oFa/gh
hREtassxRNA/NK9yiWallENoYY4mo7Bxg6dsD4g8Y0uyD0Coju850kxpuv6qtYBI
fquCqturM1dytMj9BTXGDHB9KaJjIPUggAmqb8EKnaJHVn9mmlhQaDgOagb7wSk7
s/uR0aK6Yy/J4ap3bHHcs9rGrecCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQU6hgoTtn+AYv/ohqfJt3RdDl1hmwwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQC1Mq2hvy2IxZYDLAgsYlQmw6J+QU1lexmlwSc7Ii24
msYUVZAb4pXcNw+u4qPH8SqVT1iP7kLYQldkN5ex72sUiMdYmvTGW7TKpUyhXxwm
qdQKvTTE7Aux4a8f41EpaAbq+8ZZyMjTbtUK55F7x6upZrq/7QsrtX45co7BAupS
bCcfx84d58Sy09GpIBzsfscxDdC8Revqsm7sCMUwO8MhAsVsY/v6kZYliZJUHKwA
m+r2C7OqsUl50nqC+g0oyB/p5LbprpqsK/B4r55zQ9J+unrlc8tajfVhgch36C9Y
TPT1Z+65r5eSBxwWABdXnNg8TZkQ5Q8eR6kRJ73pqVo4
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

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
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  logger.info("raw token = ", token)
  const verifiedPayload: JwtPayload = verify(token, certificate, {
    algorithms: ['RS256']
  }) as JwtPayload
  return verifiedPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')
  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')
  const split = authHeader.split(' ')
  const token = split[1]

  return token
}