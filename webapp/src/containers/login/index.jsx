import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import firebase from 'firebase/app'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useUserRecord from '../../hooks/useUserRecord'
import useQueryParams from '../../hooks/useQueryParams'

import LoginForm from '../../components/login-form'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import ErrorMessage from '../../components/error-message'
import LoginWithDiscord from '../../components/login-with-discord'
import LoadingIndicator from '../../components/loading-indicator'

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
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!oauth || !user) {
      return
    }

    async function main() {
      try {
        setIsError(false)
        setIsLoading(true)
        await redirectToOAuth(firebase.auth().currentUser)
        setIsError(false)
        setIsLoading(false)
      } catch (err) {
        console.error(err)
        setIsError(true)
        setIsLoading(false)
      }
    }

    main()
  }, [user === null])

  if (isLoading) {
    return <LoadingIndicator message="Redirecting..." />
  }

  if (isError) {
    return (
      <ErrorMessage>Failed to redirect back to the desktop app</ErrorMessage>
    )
  }

  if (user && !queryParams.get('code')) {
    if (oauth) {
      return <LoadingIndicator />
    } else {
      return <ErrorMessage>You are already logged in</ErrorMessage>
    }
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
        <title>Login | VR Photo Buddy</title>
        <meta name="description" content={`Log in to the site.`} />
      </Helmet>
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
