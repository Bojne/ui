const raw_jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYXdkYXdkYWRhLTQ5NDItNDhhNS04YzY2LWFkYXdkYWRhZCIsInRlbmFudF9pZCI6ImF3ZGF3ZGFkLWQ1NzAtNGYwYy05MTFkLWRjYWFiNWNlYzNkMCIsInJvbGUiOiJURU5BTlRfQURNSU4iLCJpYXQiOjE1Njg4NDAyODQsImV4cCI6MTU2ODg0MDI5OSwianRpIjoiMThiNDRhMTgtNTU2Yy00M2YzLTkxOWEtZDAwOWIwNDIzOTA3IiwiaXNzIjoiUHJlZmVjdCBDbG91ZCIsImF1ZCI6IlByZWZlY3QgQ2xvdWQgQVBJIC0gREVWIn0.3rI7CM3lT_u-8PPuTmR78ZlPeRZd4zRxsuIT9GYtr3A'

export const idToken = {
  authorizeUrl: 'https://some.authorization.url/oauth2/authorize',
  claims: {
    sub: 'abc123',
    name: 'Marvin',
    email: 'marvin@theship.com',
    ver: 1,
    iss: 'https://some.issuer.url/oauth2',
    exp: 9999999999,
    iat: 9999999999,
    nonce: 'abc123'
  },
  clientId: '789xyz',
  expiresAt: 9999999999,
  idToken: raw_jwt,
  issuer: 'https://some.issuer.url/oauth2',
  scopes: ['openid', 'profile', 'email'],
  value: raw_jwt
}

export const accessToken = {
  accessToken: raw_jwt,
  authorizeUrl:
    'https://universal.prefect.io/oauth2/aus9ej78aeaYy8Lcf1d6/v1/authorize',
  claims: {
    aud: 'prefect',
    cid: 'abc123',
    exp: 9999999999,
    iat: 9999999999,
    iss: 'https://some.issuer.url/oauth2',
    jti: '456xyz',
    scp: (3)[('email', 'openid', 'profile')],
    sub: 'nicholas@prefect.io',
    uid: '00u9dbxkpyijFlaHF1d6',
    ver: 1
  },
  expiresAt: 9999999999,
  scopes: ['openid', 'profile', 'email'],
  tokenType: 'Bearer',
  userinfoUrl: 'https://some.issuer.url/userinfo',
  value: raw_jwt
}

const MOCK_TOKEN_PAYLOAD = {
  tokens: { idToken: idToken, accessToken: accessToken }
}

export const parseFromUrl = jest.fn().mockReturnValue(MOCK_TOKEN_PAYLOAD)
export const getTokens = jest.fn().mockReturnValue(MOCK_TOKEN_PAYLOAD.tokens)
export const getWithRedirect = jest.fn().mockReturnValue(MOCK_TOKEN_PAYLOAD)
export const getTokenByKey = jest.fn().mockReturnValue(false)
export const isAuthenticated = jest.fn().mockReturnValue(false)
export const isLoginRedirect = jest.fn().mockReturnValue(false)
export const getUser = jest.fn().mockReturnValue({})
export const setTokens = jest.fn()
export const signOut = jest.fn()

export class OktaAuth {
  constructor() {
    this.__exists = true

    this.token = {
      getWithRedirect: getWithRedirect,
      parseFromUrl: parseFromUrl
    }

    this.tokenManager = {
      getTokens: getTokens,
      get: getTokenByKey,
      setTokens: setTokens
    }

    this.isLoginRedirect = isLoginRedirect
    this.isAuthenticated = isAuthenticated

    this.getUser = getUser

    this.signOut = signOut
  }
}

export default OktaAuth
