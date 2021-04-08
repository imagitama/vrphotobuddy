import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import { Helmet } from 'react-helmet'

import useDatabaseQuery, {
  options,
  mapDates,
  Operators,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import { CollectionNames, PhotoFieldNames } from '../../firestore'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import Button from '../../components/button'
import Markdown from '../../components/markdown'

import * as routes from '../../routes'
import { canEditPhoto } from '../../permissions'
import { createRef, getOpenGraphUrlForRouteUrl } from '../../utils'
import { useParams } from 'react-router'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  },
  controls: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  photo: {
    '& img': {
      width: '100%'
    }
  }
})

export default () => {
  const { userId } = useParams()
  // const [, , user] = useUserRecord()
  const [isLoadingProfile, isErrorLoadingProfile, profile] = useDatabaseQuery(
    CollectionNames.Profiles,
    userId,
    { [options.populateRefs]: false }
  )
  const [isLoadingUser, isErrorLoadingUser, user] = useDatabaseQuery(
    CollectionNames.Users,
    userId,
    { [options.populateRefs]: false }
  )
  const classes = useStyles()

  if (isLoadingProfile || isLoadingUser || !user || !profile) {
    return <LoadingIndicator message="Loading user..." />
  }

  if (isErrorLoadingProfile || isErrorLoadingUser) {
    return <ErrorMessage>Failed to load user</ErrorMessage>
  }

  const { username } = user

  // const hasPermissionToEdit = canEditPhoto(user)

  return (
    <div className={classes.root}>
      <Helmet>
        <title>{`${username} | View user | vrphotobuddy`}</title>
        <meta name="description" content={`View the user ${username}`} />
        <meta property="og:title" content={username} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={`View the photo "${username}".`}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewUserWithVar.replace(':userId', userId)
          )}
        />
        <meta property="og:site_name" content="vrphotobuddy" />
      </Helmet>
      <div>
        <div className={classes.meta}>
          <Heading variant="h1">{username}</Heading>
        </div>
      </div>
    </div>
  )
}
