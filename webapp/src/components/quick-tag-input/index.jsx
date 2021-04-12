import React, { useState, useEffect, useRef } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import DoneIcon from '@material-ui/icons/Done'

import TagChip from '../tag-chip'
import Button from '../button'
import { cleanupTags } from '../../utils/tags'

const useStyles = makeStyles({
  inputWrapper: {
    position: 'relative',
    display: 'inline'
  },
  hash: {
    position: 'absolute',
    top: '50%',
    left: '13px',
    transform: 'translateY(-50%)'
  },
  textInput: {
    display: 'inline-block'
  },
  btns: {
    textAlign: 'center',
    marginTop: '1rem'
  },
  editableArea: {
    minWidth: '50px',
    display: 'inline-block',
    outline: 'none',
    position: 'relative',
    top: '7px',
    cursor: 'text',
    paddingLeft: '10px'
  },
  chip: { margin: '0 0.25rem 0.25rem 0' }
})

const convertTextIntoTags = text => (text ? text.split('\n') : [])
const convertTagsIntoText = tags => (tags ? tags.join('\n') : '')

const mergeInNewTags = (currentTags, newTags) => {
  const mergedTags = currentTags.concat(newTags)

  return mergedTags.filter((tag, idx) => mergedTags.indexOf(tag) === idx)
}

// NOTE: onChange does not cleanup tags for you (onDone does)
export default ({ currentTags = [], onChange, onDone, showInfo = true }) => {
  const classes = useStyles()
  const [newTags, setNewTags] = useState(currentTags)
  const tagInputRef = useRef()
  const [isTagInputVisible, setIsTagInputVisible] = useState(false)

  useEffect(() => {
    if (currentTags) {
      setNewTags(currentVal => mergeInNewTags(currentVal, currentTags))
    }
  }, [currentTags ? currentTags.join('+') : null])

  const deleteTag = tag => {
    setNewTags(tags => tags.filter(tagItem => tagItem !== tag))
  }

  useEffect(() => {
    if (!isTagInputVisible) {
      return
    }
    tagInputRef.current.focus()
    tagInputRef.current.addEventListener('keyup', e => {
      if (e.keyCode === 13) {
        const newTagValue = e.target.innerText
        setNewTags(tags => tags.concat([newTagValue]))
        e.target.innerText = ''
        e.preventDefault()
        return false
      }
    })
  }, [isTagInputVisible])

  return (
    <>
      {newTags.map(tag => (
        <Chip
          key={tag}
          label={`#${tag}`}
          color="primary"
          onDelete={() => deleteTag(tag)}
          className={classes.chip}
        />
      ))}
      {!isTagInputVisible && (
        <Chip
          label="+"
          onClick={() => setIsTagInputVisible(true)}
          className={classes.chip}
        />
      )}
      {isTagInputVisible && (
        <div className={classes.inputWrapper}>
          <span className={classes.hash}>#</span>
          <Chip
            className={classes.textInput}
            label={
              <span
                className={classes.editableArea}
                contentEditable
                ref={tagInputRef}
              />
            }
          />
          <Chip onClick={onDone} label="Done" />
        </div>
      )}
    </>
  )
}
