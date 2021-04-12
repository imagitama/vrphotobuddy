import React, { useEffect, useState } from 'react'
import CheckIcon from '@material-ui/icons/Check'
import { makeStyles } from '@material-ui/core/styles'

import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseQuery, { options } from '../../hooks/useDatabaseQuery'
import { CollectionNames, UserMetaFieldNames } from '../../firestore'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Paper from '../paper'
import Heading from '../heading'

const twitterOAuthUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${
  process.env.REACT_APP_PATREON_CLIENT_ID
}&redirect_uri=${
  process.env.REACT_APP_PATREON_REDIRECT_URI
}&scope=identity%20campaigns.members`
let oauthCode

// const callbackUrl =
//   process.env.REACT_APP_TWITTER_CALLBACK_URL || 'http://localhost:3000/login'

const getRequestToken = () => {
  return callFunction('connectToTwitter', {})
}

const getPatreonUserInfoWithCode = oauthCode => {
  return callFunction('getPatreonUserInfo', {
    code: oauthCode
  })
}

const useStyles = makeStyles({
  connectedMessage: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    fontSize: '150%',
    marginRight: '1rem'
  },
  rewardItem: {
    marginBottom: '0.5rem'
  }
})

export default () => {
  const userId = useFirebaseUserId()
  const [isLoadingMeta, isErrorLoadingMeta, metaResult] = useDatabaseQuery(
    CollectionNames.UserMeta,
    userId,
    {
      [options.subscribe]: true,
      [options.queryName]: 'usermeta-patreon'
    }
  )
  const [result, setResult] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isErrored, setIsErrored] = useState(false)
  const classes = useStyles()

  useEffect(() => {
    async function main() {
      try {
        let queryParams = window.location.search

        if (!queryParams) {
          return
        }

        queryParams = queryParams.replace('?', '')
        queryParams = queryParams.split('&')
        queryParams = queryParams
          .map(paramWithEquals => paramWithEquals.split('='))
          .reduce((params, [key, val]) => ({ ...params, [key]: val }), {})

        if (!queryParams.code) {
          return
        }

        setIsLoading(true)
        setIsErrored(false)

        oauthCode = queryParams.code

        const {
          data: { isOneDollarTierPatron }
        } = await getPatreonUserInfoWithCode(oauthCode)

        setIsLoading(false)
        setIsErrored(false)

        setResult(isOneDollarTierPatron)
      } catch (err) {
        console.error(err)
        setIsLoading(false)
        setIsErrored(true)
        handleError(err)
      }
    }

    main()
  }, [])

  const beginConnect = async () => {
    try {
      setIsLoading(true)
      setIsErrored(false)

      const requestToken = await getRequestToken()

      setIsLoading(false)
      setIsErrored(false)
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      setIsErrored(true)
      handleError(err)
    }
  }

  if (isLoadingMeta) {
    return <LoadingIndicator message="Loading your details..." />
  }

  if (isLoading) {
    return <LoadingIndicator message="Talking to Twitter..." />
  }

  if (result && !metaResult) {
    return (
      <LoadingIndicator message="Connected to Twitter and waiting for an update..." />
    )
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to talk to Twitter <br />
        <br />
        <Button
          onClick={() => {
            setIsErrored(false)
            setIsLoading(false)
            setResult(null)
          }}>
          Try Again
        </Button>
      </ErrorMessage>
    )
  }

  if (isErrorLoadingMeta) {
    return <ErrorMessage>Failed to load your details</ErrorMessage>
  }

  if (!metaResult || !metaResult[UserMetaFieldNames.hasConnectedToTwitter]) {
    return (
      <div>
        <p>Click the button below to connect your account with Twitter.</p>
        <Button onClick={beginConnect}>Connect with Twitter</Button>
      </div>
    )
  }

  return (
    <>
      <Paper className={classes.connectedMessage}>
        <div className={classes.icon}>
          <CheckIcon />
        </div>
        <div>You have successfully connected your account with Twitter</div>
      </Paper>
      <p>
        You can click this button:{' '}
        <Button onClick={beginConnect}>Connect with Twitter</Button>
      </p>
    </>
  )
}
