import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import LazyLoad from 'react-lazyload'
import PhotoAlbumIcon from '@material-ui/icons/PhotoAlbum'

import * as routes from '../../routes'
import FormattedDate from '../formatted-date'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

const useStyles = makeStyles(theme => ({
  root: {
    width: '200px',
    margin: '0.5rem',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px',
      margin: '0.25rem'
    },
    overflow: 'visible'
  },
  landscape: {
    width: '100%',
    '& $media': {
      width: '200px'
    }
  },
  landscapeLink: {
    display: 'flex'
  },
  media: {
    position: 'relative', // nsfw chip
    zIndex: -1,
    height: '200px',
    [mediaQueryForTabletsOrBelow]: {
      height: '160px'
    },
    flexShrink: 0
  },
  cover: {
    textAlign: 'center',
    padding: '2rem 0',
    background: theme.palette.primary.main,
    '& svg': {
      color: '#FFF',
      fontSize: '500%'
    }
  },
  date: {
    margin: '0.25rem 0',
    color: 'rgba(255, 255, 255, 0.4)'
  },
  cardContent: {
    paddingBottom: `${theme.spacing(2)}px !important`
  }
}))

function truncateTextAndAddEllipsis(text) {
  return text && text.length >= 100 ? `${text.slice(0, 100)}...` : text
}

export default ({
  album: { id, coverImageUrl, title, description, createdAt }
}) => {
  const classes = useStyles()
  const cardRef = useRef()

  return (
    <Card className={classes.root} ref={cardRef}>
      <CardActionArea className={classes.actionArea}>
        <Link
          to={routes.viewAlbumWithVar.replace(':albumId', id)}
          className={classes.link}>
          <div className={classes.cover}>
            <PhotoAlbumIcon />
          </div>
          <CardContent className={classes.cardContent}>
            <Typography variant="h5" component="h2">
              {title}
            </Typography>
            {createdAt && (
              <div className={classes.date}>
                <FormattedDate date={createdAt} />
              </div>
            )}
            <Typography variant="body2" color="textSecondary" component="p">
              {truncateTextAndAddEllipsis(description)}
            </Typography>
          </CardContent>
        </Link>
      </CardActionArea>
    </Card>
  )
}
