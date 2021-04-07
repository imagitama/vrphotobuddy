import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useUserRecord from '../../hooks/useUserRecord'
import useQueryParams from '../../hooks/useQueryParams'

import LoginForm from '../../components/login-form'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import ErrorMessage from '../../components/error-message'
import LoginWithDiscord from '../../components/login-with-discord'

const OAUTH_AUTH_TOKEN_ENDPOINT_URL = process.env.REACT_APP_OAUTH_REDIRECT_URL

const redirectToOAuth = async user => {
  console.debug('redirectToOAuth', user, OAUTH_AUTH_TOKEN_ENDPOINT_URL)

  if (!user) {
    return
  }

  const authToken = new URLSearchParams(window.location.search).get('authToken')

  const response = await fetch(OAUTH_AUTH_TOKEN_ENDPOINT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      auth_token: authToken,
      id_token: await user.getIdToken(),
      success: 'true'
    })
  })

  const data = await response.json()

  console.log('auth back: ', data)

  window.location = data.url.replace('#', '?')
}

export default ({ oauth = false }) => {
  const [, , user] = useUserRecord()
  const queryParams = useQueryParams()
  const { push } = useHistory()

  if (user && !queryParams.get('code')) {
    return <ErrorMessage>You are already logged in</ErrorMessage>
  }

  if (queryParams.get('code')) {
    return (
      <LoginWithDiscord
        code={queryParams.get('code')}
        onSuccess={() => push(routes.myAccount)}
        onFail={() => push(routes.login)}
      />
    )
  }

  return (
    <>
      <Helmet>
        <title>Login | vrphotobuddy</title>
        <meta name="description" content={`Log in to the site.`} />
      </Helmet>
      <Heading variant="h1">Login</Heading>
      <BodyText>Enter your details below to login.</BodyText>
      <LoginForm
        onSuccess={async authResult => {
          trackAction('Login', 'Click login button')
          console.debug('is oauth?', oauth, authResult)

          if (oauth) {
            await redirectToOAuth(authResult.user)
          } else {
            push(routes.home)
          }
        }}
      />
      <BodyText>
        You can read our <Link to={routes.privacyPolicy}>Privacy Policy</Link>{' '}
        here.
      </BodyText>
      <BodyText>
        Reset your password <Link to={routes.resetPassword}>here</Link>.
      </BodyText>
    </>
  )
}
