import React from 'react'
import NightsStayIcon from '@material-ui/icons/NightsStay'
import WbSunnyIcon from '@material-ui/icons/WbSunny'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, PhotoFieldNames } from '../../firestore'
import { createRef } from '../../utils'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'
import Button from '../button'

export default ({ photoId, currentIsAdult, hideLabel = false }) => {
  const userId = useFirebaseUserId()
  const [isSaving, , , save] = useDatabaseSave(CollectionNames.Photos, photoId)

  const onClick = async () => {
    try {
      await save({
        [PhotoFieldNames.isAdult]: !currentIsAdult,
        [PhotoFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [PhotoFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save photo to database', err)
      handleError(err)
    }
  }

  return (
    <Button
      onClick={onClick}
      icon={currentIsAdult === true ? <WbSunnyIcon /> : <NightsStayIcon />}>
      {hideLabel !== true
        ? isSaving
          ? 'Saving...'
          : currentIsAdult === true
          ? 'Make SFW'
          : 'Make NSFW'
        : ''}
    </Button>
  )
}
