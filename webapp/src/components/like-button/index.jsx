import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'

import Button from '../button'

import useDatabaseQuery, {
  Operators,
  options
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import {
  CollectionNames,
  LikeFieldNames,
  quickDeleteRecord
} from '../../firestore'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

const useStyles = makeStyles({})

export default ({ photoId, onClick = null }) => {
  const userId = useFirebaseUserId()
  const [, , likesForPhoto] = useDatabaseQuery(
    CollectionNames.Likes,
    [
      [
        LikeFieldNames.photo,
        Operators.EQUALS,
        createRef(CollectionNames.Photos, photoId)
      ]
    ],
    {
      [options.queryName]: 'get-likes-for-photo',
      [options.subscribe]: true
    }
  )
  const [isSaving, , isSavingError, save] = useDatabaseSave(
    CollectionNames.Likes
  )
  const classes = useStyles()

  const onLikeClick = async () => {
    try {
      if (onClick) {
        onClick({
          newValue: true
        })
      }

      await save({
        [LikeFieldNames.photo]: createRef(CollectionNames.Photos, photoId),
        [LikeFieldNames.createdBy]: createRef(CollectionNames.Users, userId),
        [LikeFieldNames.createdAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save like', err)
      handleError(err)
    }
  }

  const likeCount = likesForPhoto ? likesForPhoto.length : 0

  let myLike = null

  if (likeCount > 0) {
    myLike = likesForPhoto.find(
      like => like[LikeFieldNames.createdBy].id === userId
    )
  }

  const onUnlikeClick = async () => {
    try {
      if (!myLike) {
        return
      }

      await quickDeleteRecord(CollectionNames.Likes, myLike.id)
    } catch (err) {
      console.error('Failed to delete like', err)
      handleError(err)
    }
  }

  if (!userId) {
    return (
      <Button color="default" className={classes.loggedOutBtn}>
        Log in to like ({likeCount})
      </Button>
    )
  }

  if (isSaving) {
    return <Button color="default">Saving...</Button>
  }

  if (isSavingError) {
    return <Button disabled>Error</Button>
  }

  if (myLike) {
    return (
      <Button
        color="default"
        className={classes.loggedOutBtn}
        icon={<CheckIcon />}
        onClick={onUnlikeClick}>
        Liked ({likeCount})
      </Button>
    )
  }

  return (
    <Button color="default" onClick={onLikeClick} icon={<ThumbUpIcon />}>
      Like ({likeCount})
    </Button>
  )
}
