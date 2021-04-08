import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, AlbumFieldNames } from '../../firestore'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import SuccessMessage from '../../components/success-message'
import Heading from '../../components/heading'
import Button from '../../components/button'
import TextInput from '../../components/text-input'

import * as routes from '../../routes'
import { createRef, getOpenGraphUrlForRouteUrl } from '../../utils'

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
  const [, , user] = useUserRecord()
  const classes = useStyles()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Albums
  )
  const [newFields, setNewFields] = useState({})

  const onFieldChanged = (fieldName, newVal) =>
    setNewFields(currentVal => ({
      ...currentVal,
      [fieldName]: newVal
    }))

  const onSaveClick = async () => {
    try {
      if (!newFields[AlbumFieldNames.title]) {
        return
      }

      await save({
        ...newFields,
        createdAt: new Date(),
        createdBy: createRef(CollectionNames.Users, user.id)
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className={classes.root}>
      <Helmet>
        <title>{`Create album | vrphotobuddy`}</title>
        <meta
          name="description"
          content={`Create a new album for your photos.`}
        />
        <meta property="og:title" content={'Create Album'} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={`Create a new album for your photos.`}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(routes.createAlbum)}
        />
        <meta property="og:site_name" content="vrphotobuddy" />
      </Helmet>
      <div>
        <div className={classes.meta}>
          <Heading variant="h1">Create Album</Heading>
        </div>
        {isSaving && <LoadingIndicator message="Saving..." />}
        {isSaveSuccess && (
          <SuccessMessage>
            Album has been created <Button>View Album</Button>
          </SuccessMessage>
        )}
        {isSaveError && <ErrorMessage>Failed to create album</ErrorMessage>}
        Title
        <TextInput
          value={newFields[AlbumFieldNames.title]}
          onChange={e => onFieldChanged(AlbumFieldNames.title, e.target.value)}
        />
        Description
        <TextInput
          value={newFields[AlbumFieldNames.description]}
          onChange={e =>
            onFieldChanged(AlbumFieldNames.description, e.target.value)
          }
        />
        <Button onClick={onSaveClick}>Create</Button>
      </div>
    </div>
  )
}
