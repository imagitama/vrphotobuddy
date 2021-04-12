import React, { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import TagFacesIcon from '@material-ui/icons/TagFaces'
import DeleteIcon from '@material-ui/icons/Delete'
import DoneIcon from '@material-ui/icons/Done'

import TextInput from '../text-input'
import Button from '../button'
import {
  UserTagFieldNames,
  CollectionNames,
  PhotoFieldNames,
  UserFieldNames
} from '../../firestore'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { createRef } from '../../utils'
import { handleError } from '../../error-handling'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { Link } from 'react-router-dom'
import * as routes from '../../routes'
import useDatabaseQuery from '../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    '&:hover $currentTags': {
      opacity: 1
    }
  },
  tagging: {
    cursor: 'pointer',
    '& $currentTags': {
      opacity: 1
    }
  },
  currentTags: {
    opacity: 0,
    transition: 'all 100ms'
  },
  tagBox: {
    position: 'absolute',
    width: '100px',
    height: '100px',
    border: '2px solid #FFF',
    transform: 'translate(-50%, -50%)',
    boxShadow: '1px 1px 1px #000',
    opacity: '0.5',
    transition: 'all 100ms',
    '&:hover': {
      opacity: 1
    },
    overflow: 'hidden'
  },
  link: {
    color: '#FFF',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  newTagBox: {
    background: 'rgba(0, 0, 0, 0.5)',
    opacity: 1
  },
  doneBtn: {
    cursor: 'pointer'
  },
  deleteBtn: {
    cursor: 'pointer',
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: '0.1rem'
  },
  status: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  textInput: {
    width: '100%',
    padding: '0.1rem',
    appearance: 'none',
    outline: 'none',
    border: 'none',
    background: 'none',
    color: '#FFF'
  },
  username: {
    padding: '0.25rem'
  },
  hint: {
    fontSize: '50%'
  },
  menuHeading: {
    padding: '0.5rem'
  }
})

function TagBox({
  vrchatUsername,
  positionX,
  positionY,
  onDone,
  onDelete,
  onCancel
}) {
  const classes = useStyles()
  const [username, setUsername] = useState('')
  const inputRef = useRef()
  const deleteBtnRef = useRef()
  const formRef = useRef()
  // TODO: Maintain a separate list for these things
  const [, , allUsers] = useDatabaseQuery(CollectionNames.Users)
  const [, , allPhotos] = useDatabaseQuery(CollectionNames.Photos)
  const [isMenuOpen, setIsMenuOpen] = useState(true)

  useEffect(() => {
    if (!onDone) {
      return
    }

    inputRef.current.focus()
  }, [onDone !== undefined, positionX, positionY])

  useEffect(() => {
    if (!onDone) {
      return
    }

    inputRef.current.focus()

    const onInputClick = e => e.stopPropagation()
    const onDeleteBtnClick = e => {
      onDelete()
      e.stopPropagation()
    }
    const onKeyDown = e => {
      // enter
      if (e.keyCode === 13) {
        onDone(username)
        // escape
      } else if (e.keyCode === 27) {
        onCancel()
      }
    }

    inputRef.current.addEventListener('keydown', onKeyDown)
    inputRef.current.addEventListener('click', onInputClick)

    if (onDelete) {
      deleteBtnRef.current.addEventListener('click', onDeleteBtnClick)
    }

    return () => {
      inputRef.current.removeEventListener('keydown', onKeyDown)
      inputRef.current.removeEventListener('click', onInputClick)

      if (onDelete) {
        deleteBtnRef.current.removeEventListener('click', onDeleteBtnClick)
      }
    }
  }, [onDone !== undefined, onDelete !== undefined, username])

  let userUsernames = []

  if (allUsers && allUsers.length) {
    userUsernames = allUsers.reduce(
      (allUsernames, { [UserFieldNames.username]: username }) =>
        allUsernames.concat([username]),
      []
    )
  }

  let existingTaggedUsernames = []

  if (allPhotos && allPhotos.length) {
    existingTaggedUsernames = allPhotos
      .reduce(
        (finalUsernames, { [PhotoFieldNames.userTags]: userTags }) =>
          finalUsernames.concat(userTags),
        []
      )
      .filter(username => !userUsernames.includes(username))

    existingTaggedUsernames = existingTaggedUsernames.filter(
      (username, idx) => existingTaggedUsernames.indexOf(username) === idx
    )
  }

  // existingTaggedUsernames = existingTaggedUsernames.filter(
  //   (item, idx) => existingTaggedUsernames.indexOf(item) === idx
  // )

  return (
    <div
      className={`${classes.tagBox} ${onDone ? classes.newTagBox : ''}`}
      style={{ top: `${positionY}%`, left: `${positionX}%` }}>
      {vrchatUsername && (
        <Link
          to={routes.viewUserTagsWithVar.replace(
            ':vrchatUsernameOrUserId',
            vrchatUsername
          )}
          className={classes.link}>
          {vrchatUsername && (
            <span className={classes.username}>{vrchatUsername}</span>
          )}
        </Link>
      )}
      {onDelete && (
        <div className={classes.deleteBtn} ref={deleteBtnRef}>
          <DeleteIcon />
        </div>
      )}
      {onDone && (
        <div className={classes.form} ref={formRef}>
          <Menu
            anchorEl={formRef.current}
            getContentAnchorEl={null}
            open={isMenuOpen}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            onClose={() => setIsMenuOpen(false)}>
            <span className={classes.menuHeading}>Signed up users</span>
            {userUsernames.map(username => (
              <MenuItem key={username} onClick={() => onDone(username)}>
                {username}
              </MenuItem>
            ))}
            <span className={classes.menuHeading}>Previously tagged users</span>
            {existingTaggedUsernames.map(username => (
              <MenuItem key={username} onClick={() => onDone(username)}>
                {username}
              </MenuItem>
            ))}
            <span className={classes.menuHeading}>Other</span>

            <MenuItem onClick={() => setIsMenuOpen(false)}>Create New</MenuItem>
          </Menu>
          <span className={classes.hint}>
            Type a VRChat username then press Enter:
          </span>{' '}
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className={classes.textInput}
            ref={inputRef}
          />
        </div>
      )}
    </div>
  )
}

export default ({
  photoId,
  currentTags,
  currentTagPositions,
  isTagging = false,
  canEdit = false,
  onDone,
  onCancel
}) => {
  const classes = useStyles()
  const containerRef = useRef()
  const userId = useFirebaseUserId()
  const [newTag, setNewTag] = useState(null)
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Photos,
    photoId
  )

  const onSaveBtnClick = async (newTags, newTagPositions) => {
    try {
      if (!userId) {
        throw new Error('Cannot save without being logged in')
      }

      await save({
        [PhotoFieldNames.userTags]: newTags,
        [PhotoFieldNames.userTagPositions]: newTagPositions,
        [PhotoFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [PhotoFieldNames.lastModifiedAt]: new Date()
      })

      setNewTag(null)

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save tags', err)
      handleError(err)
    }
  }

  useEffect(() => {
    if (!isTagging) {
      return
    }

    const onClick = e => {
      const rect = containerRef.current.getBoundingClientRect()

      const positionX = parseInt(((e.pageX - rect.left) / rect.width) * 100)
      const positionY = parseInt(((e.pageY - rect.top) / rect.height) * 100)

      setNewTag({
        positionX,
        positionY
      })

      e.preventDefault()
      e.stopPropagation()
    }

    containerRef.current.addEventListener('click', onClick)

    return () => containerRef.current.removeEventListener('click', onClick)
  }, [isTagging])

  return (
    <div
      className={`${classes.root} ${isTagging ? classes.tagging : ''}`}
      ref={containerRef}>
      <div className={classes.status}>
        {isSaving
          ? 'Saving...'
          : isSaveSuccess
          ? 'Saved'
          : isSaveError
          ? 'Error'
          : ''}
      </div>
      <div className={classes.currentTags}>
        {currentTags.map((vrchatUsername, idx) => (
          <TagBox
            vrchatUsername={vrchatUsername}
            positionX={currentTagPositions[idx][UserTagFieldNames.positionX]}
            positionY={currentTagPositions[idx][UserTagFieldNames.positionY]}
            onDelete={
              canEdit
                ? () => {
                    onSaveBtnClick(
                      currentTags.filter((item, itemIdx) => itemIdx !== idx)
                    )
                  }
                : null
            }
          />
        ))}
      </div>
      {isTagging && newTag && (
        <TagBox
          positionX={newTag.positionX}
          positionY={newTag.positionY}
          onDone={newUsername => {
            if (!newUsername) {
              return
            }

            onSaveBtnClick(
              currentTags.concat([newUsername]),
              currentTagPositions.concat([
                {
                  [UserTagFieldNames.positionX]: newTag.positionX,
                  [UserTagFieldNames.positionY]: newTag.positionY
                }
              ])
            )
          }}
          onCancel={onCancel}
        />
      )}
    </div>
  )
}
