import React, { useState, useEffect, Fragment } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import TagChip from '../tag-chip'
import Button from '../button'
import { cleanupTags } from '../../utils/tags'

const useStyles = makeStyles({
  textInput: {
    width: '100%',
    margin: '0.5rem 0'
  },
  btns: {
    textAlign: 'center',
    marginTop: '1rem'
  }
})

const convertTextIntoTags = text => (text ? text.split('\n') : [])
const convertTagsIntoText = tags => (tags ? tags.join('\n') : '')

const mergeInNewTags = (currentTags, newTags) => {
  const mergedTags = currentTags.concat(newTags)

  return mergedTags.filter((tag, idx) => mergedTags.indexOf(tag) === idx)
}

const popularTagGroups = [
  {
    label: 'Descriptive',
    tags: ['cute', 'funny', 'lewd']
  },
  {
    label: 'Avatar species',
    tags: ['awtter', 'canis_woof', 'rexouium', 'avali', 'shiba']
  },
  {
    label: 'World',
    tags: ['meroom', 'summer_solitude']
  }
]

// NOTE: onChange does not cleanup tags for you (onDone does)
export default ({ currentTags = [], onChange, onDone, showInfo = true }) => {
  const classes = useStyles()
  const [newTags, setNewTags] = useState(currentTags)

  useEffect(() => {
    if (currentTags) {
      setNewTags(currentVal => mergeInNewTags(currentVal, currentTags))
    }
  }, [currentTags ? currentTags.join('+') : null])

  const onClickPopularTag = tag =>
    setNewTags(currentVal => {
      const newVal = currentVal.concat([tag])
      onChange(newVal)
      return newVal
    })
  const onClickExistingTag = tag =>
    setNewTags(currentVal => currentVal.filter(item => item !== tag))

  return (
    <>
      <br />
      <strong>One tag per line</strong>
      <br />
      <br />
      Popular tags:
      {popularTagGroups.map(({ label, tags }) => (
        <Fragment key={label}>
          <br />
          {label}:
          {tags.map(tag => (
            <TagChip
              key={tag}
              tagName={tag}
              onClick={() => onClickPopularTag(tag)}
            />
          ))}
        </Fragment>
      ))}
      <br />
      <TextField
        variant="outlined"
        className={classes.textInput}
        value={convertTagsIntoText(newTags)}
        onChange={e => {
          const newVal = convertTextIntoTags(e.target.value)

          setNewTags(newVal)

          if (onChange) {
            onChange(newVal)
          }
        }}
        rows={10}
        multiline
      />
      Click to remove:{' '}
      {cleanupTags(newTags).map(tagName => (
        <TagChip
          key={tagName}
          tagName={tagName}
          onClick={() => onClickExistingTag(tagName)}
        />
      ))}
      {onDone && (
        <div className={classes.btns}>
          <Button onClick={() => onDone(cleanupTags(newTags))}>Done</Button>
        </div>
      )}
    </>
  )
}
