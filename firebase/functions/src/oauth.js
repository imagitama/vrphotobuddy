const { Configuration } = require('oauth2-firebase-auth')
// const admin = require('firebase-admin')
const config = require('./config')
const { db, CollectionNames, Operators } = require('./firebase')

// initialize our admin app
// require('./firebase')

const OAUTH_AUTH_TOKEN_SECRET_KEY_32 = config.oauth.auth_token_secret_key_32
const OAUTH_API_KEY = config.oauth.api_key
const OAUTH_LOGIN_PAGE_URL = config.oauth.login_page_url

// TODO: Flag to disable this
// TODO: Check if settings not set

const getConsentTemplate = () => {
  return class MyConsentViewTemplate {
    provide() {
      return Promise.resolve(`
  <p><%= providerName %> requests the following permissions:</p>
  <ul>
      <% for (const key of scope.split(" ")) { %>
      <li><%= scopes.get(key) %></li>
      <% } %>
  </ul>
  <p>Could you allow them?</p>
  <form method="post" action="/authorize/consent">
      <input type="hidden" name="auth_token" value="<%= encryptedAuthToken %>">
      <input type="hidden" name="user_id" value="<%= encryptedUserId %>">
      <button type="submit" name="action" value="allow">Allow</button>
      <button type="submit" name="action" value="deny">Deny</button>
  </form>
  `)
    }
  }
}

console.debug(
  `Initializing oauth with API key ${OAUTH_API_KEY} and login URL ${OAUTH_LOGIN_PAGE_URL}`
)

Configuration.init({
  crypto_auth_token_secret_key_32: OAUTH_AUTH_TOKEN_SECRET_KEY_32,
  project_api_key: OAUTH_API_KEY,
  views_consent_template: getConsentTemplate(),
})

module.exports.getCustomAuthenticationUrl = () => OAUTH_LOGIN_PAGE_URL

const getIsOauthTokenValid = async (token) => {
  console.debug(`checking if token is valid: ${token}`)

  if (!token) {
    console.debug('oauth token invalid - none provided')
    return false
  }

  let matchingDocs

  try {
    matchingDocs = await db
      .collection('oauth2_access_tokens')
      .where('token', Operators.EQUALS, token)
      .get()
  } catch (err) {
    console.debug(
      `oauth token invalid - could not read database: ${err.message}`
    )
    throw err
  }

  if (matchingDocs.docs.length === 1) {
    const doc = matchingDocs.docs[0]

    const dateNow = new Date()
    const createdOnDate = new Date(doc.get('created_on'))
    const expiresInDate = new Date(
      doc.get('created_on') + doc.get('expires_in') * 1000
    )

    console.debug(`created on: ${createdOnDate}`)

    console.debug(`expires: ${expiresInDate}`)

    if (expiresInDate > dateNow) {
      console.debug(`token is valid`)
      return true
    } else {
      console.debug(`oauth token invalid - expired`)
      return false
    }
  } else {
    console.debug(
      `oauth token invalid - weird number of results: ${matchingDoc.docs.length}`
    )
    return false
  }
}
module.exports.getIsOauthTokenValid = getIsOauthTokenValid
