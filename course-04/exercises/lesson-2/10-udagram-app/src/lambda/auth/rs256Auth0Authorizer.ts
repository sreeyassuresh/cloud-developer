
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJbniErmiRjuMWMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1icDQ1eng2cy51cy5hdXRoMC5jb20wHhcNMjIwMjA5MDQ1NjIwWhcN
MzUxMDE5MDQ1NjIwWjAkMSIwIAYDVQQDExlkZXYtYnA0NXp4NnMudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8UwRR4Xnb+dxLf0B
M4tutw6FtUuvNgc8OUUbcazdRRPrx7BkQJRN2Q7PGi0u17swAgPnvKAdrukWP76/
B8zqshsQKnYg7eS9/5/tN7+qt9eQm4SvV5nUIl4wV0fav5/8kzyO57RIQyYTalst
7i6qDOYwxbq7gsy8nn9UPBpkU++oKbQf+tZ1VIc5kC/VBebP31S7Jke8JPJu1to4
hTqgASSKDVHfmQyjPqxWh2m2B5Oc9dHoePE111yyyZtEnaD3qtW8Dr0QYfxwZKOv
KWIe9ABgBVPVaftCKh4tGkvOy4W7+2TxaO0tuqpI9wmJImgHCglNLPkomMRtHPJr
wkEW/QIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQisdaOZwrW
O2gCycxWis1k5G+a4jAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AOWDiaWvoRixjC4IrqD07n9Fja+lhaumTSy43xVvKfRd45t9wUteU7/f9Q2dP9Ue
RvgnYVA1OkBxtzD6g1PoVrWecocn5AMPjlfXymwHZ27eN+1e+sfu3btDnmGWBrJO
Dery33kf9gCbhsRtmXnc+5hDvIj4zHPGvSCvCv+LqbCdwdffANJNYFjPdaEFlu/H
IVytjELvAufPyeZZU9rD55AWvXDLz/HQ+3uj1dj3EdLWfx/SBShDWuPagNNKe35x
zEoMYZQFYF79vfRTXdJVsg5mTNX86zbgCu0SNPqiTagicP53VB9rDpcTuMj0vBwc
BWyxHbPtHnRuhjaSWaW53xc=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

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
    console.log('User authorized', e.message)

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

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
