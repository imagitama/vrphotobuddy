import React from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useUserRecord from '../../hooks/useUserRecord'
import { CollectionNames, UserFieldNames } from '../../firestore'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

export default ({ onClick = null }) => {
  const myUserId = useFirebaseUserId()
  const [isLoadingUser, isErroredUser, user] = useUserRecord()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Users,
    user && user.id
  )

  if (isLoadingUser || !user || isSaving) {
    return <LoadingIndicator />
  }

  if (isErroredUser) {
    return <ErrorMessage>Failed to load user account</ErrorMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save your changes</ErrorMessage>
  }

  const { [UserFieldNames.enabledAdultContent]: enabledAdultContent } = user

  const onCheckboxChange = async event => {
    const newValue = event.target.checked

    try {
      if (onClick) {
        onClick({ newValue })
      }

      await save({
        [UserFieldNames.enabledAdultContent]: newValue,
        [UserFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          myUserId
        ),
        [UserFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save user to toggle adult flag', err)
      handleError(err)
    }
  }

  return (
    <FormControl>
      <FormControlLabel
        control={
          <Checkbox checked={enabledAdultContent} onChange={onCheckboxChange} />
        }
        label="I am over 18 and I want to view adult content."
      />
      {isSaveSuccess && 'Saved successfully'}
    </FormControl>
  )
}
