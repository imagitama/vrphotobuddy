import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'
import {
  CollectionNames,
  quickReadRecord,
  PhotoFieldNames
} from '../../firestore'

import LoadingIndicator from '../../components/loading-indicator'
import PhotoResults from '../../components/photo-results'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import NoResultsMessage from '../../components/no-results-message'

import * as routes from '../../routes'
import { searchIndexNameLabels, searchIndexNames } from '../../modules/app'
import { createRef } from '../../utils'
import { handleError } from '../../error-handling'

function Results({ vrchatUsernameOrUserId }) {
  const [, , user] = useUserRecord()
  const [whereValue, setWhereValue] = useState(false)

  useEffect(() => {
    async function main() {
      try {
        const result = await quickReadRecord(
          CollectionNames.Users,
          vrchatUsernameOrUserId
        )

        if (result) {
          setWhereValue(
            createRef(CollectionNames.Users, vrchatUsernameOrUserId)
          )
        } else {
          setWhereValue(vrchatUsernameOrUserId)
        }
      } catch (err) {
        console.error(err)
        handleError(err)
      }
    }

    main()
  }, [vrchatUsernameOrUserId])

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Photos,
    whereValue !== false
      ? [[PhotoFieldNames.userTags, Operators.ARRAY_CONTAINS, whereValue]]
      : false
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading photos..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get photos</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <PhotoResults photos={results} />
}

export default ({
  match: {
    params: { vrchatUsernameOrUserId }
  }
}) => {
  return (
    <>
      <Helmet>
        <title>
          Browse users named {vrchatUsernameOrUserId} | VR Photo Buddy
        </title>
        <meta
          name="description"
          content={`Browse all photos that have the user ${vrchatUsernameOrUserId} tagged in them.`}
        />
      </Helmet>
      <Heading variant="h1">
        Browse users named "{vrchatUsernameOrUserId}"
      </Heading>
      <Results vrchatUsernameOrUserId={vrchatUsernameOrUserId} />
    </>
  )
}
