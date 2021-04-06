import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
// import Markdown from '../markdown'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import Checkbox from '@material-ui/core/Checkbox'

import Paper from '../paper'
import Button from '../button'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'
import { addQuotesToDescription } from '../../utils/formatting'

const useStyles = makeStyles({
  input: {
    width: '100%',
    marginBottom: '1rem'
  },
  controls: {
    textAlign: 'center'
  }
})

export default ({
  assetId,
  description = '',
  onChange,
  onDone,
  actionCategory
}) => {
  const userId = useFirebaseUserId()
  const [newDescriptionValue, setNewDescriptionValue] = useState(description)
  const [isUsingQuotes, setIsUsingQuotes] = useState(false)
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveSuccess) {
    return <SuccessMessage>Description saved</SuccessMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save description</ErrorMessage>
  }

  const onSaveBtnClick = async () => {
    try {
      if (!newDescriptionValue) {
        return
      }

      trackAction(actionCategory, 'Click save description button')

      await save({
        [AssetFieldNames.description]: newDescriptionValue,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      onDone()
    } catch (err) {
      console.error('Failed to save asset description', err)
      handleError(err)
    }
  }

  return (
    <Paper>
      <TextField
        value={newDescriptionValue}
        onChange={e => {
          setNewDescriptionValue(e.target.value)
          onChange(e.target.value)
        }}
        multiline
        rows={15}
        className={classes.input}
      />
      <Checkbox
        checked={isUsingQuotes}
        onClick={() => {
          if (!isUsingQuotes) {
            setNewDescriptionValue(currentVal => {
              const quotedDesc = addQuotesToDescription(currentVal)
              onChange(quotedDesc)
              return quotedDesc
            })
          }
          setIsUsingQuotes(!isUsingQuotes)
        }}
      />{' '}
      Add quote symbols to description (use if you copy the description from a
      third party like Gumroad)
      {/* <Markdown source={newDescriptionValue} /> */}
      <div className={classes.controls}>
        <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
          Save
        </Button>
      </div>
    </Paper>
  )
}
