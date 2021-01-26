// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'gou1p945ge'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-46nx7vs6.eu.auth0.com',            // Auth0 domain
  clientId: '63v8KzS448oFXJUuqmMkfA35mTX71fU7',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
