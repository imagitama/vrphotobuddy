import React from 'react'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { writeStorage } from '@rehooks/local-storage'
import CloseIcon from '@material-ui/icons/Close'
import Markdown from '../markdown'

import useStorage, { keys } from '../../hooks/useStorage'
import { UserFieldNames } from '../../hooks/useDatabaseQuery'
import { trackAction } from '../../analytics'

import Avatar, { sizes } from '../avatar'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2, 2),
    marginBottom: '2rem',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  leftCol: {
    flexShrink: 0,
    marginRight: '1%'
  },
  rightCol: {},
  header: {
    lineHeight: 1
  },
  message: {
    marginTop: '-8px',
    '& p:last-child': {
      marginBottom: 0
    }
  },
  hideBtn: {
    position: 'absolute',
    padding: '0.5rem',
    top: 0,
    right: 0,
    '&:hover': {
      cursor: 'pointer'
    }
  }
}))

export default ({ id, title, message, createdBy }) => {
  const classes = useStyles()
  const [hiddenNotices] = useStorage(keys.hiddenNotices, [])

  const onHideBtnClick = () => {
    writeStorage(keys.hiddenNotices, hiddenNotices.concat([id]))
    trackAction('Global', 'Click hide notice', id)
  }

  if (hiddenNotices.includes(id)) {
    return null
  }

  return (
    <Paper className={classes.root}>
      <div className={classes.leftCol}>
        <Avatar
          url={
            createdBy && createdBy[UserFieldNames.avatarUrl]
              ? createdBy[UserFieldNames.avatarUrl]
              : null
          }
          username={createdBy ? createdBy.username : ''}
          size={sizes.TINY}
        />
      </div>
      <div className={classes.rightCol}>
        <Typography variant="h5" component="h3" className={classes.header}>
          {title}
        </Typography>
        <div className={classes.message}>
          <Markdown source={message} />
        </div>
        <div className={classes.hideBtn} onClick={onHideBtnClick}>
          <CloseIcon />
        </div>
      </div>
    </Paper>
  )
}
