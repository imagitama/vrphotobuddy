import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import LazyLoad from 'react-lazyload'

import * as routes from '../../routes'
import FormattedDate from '../formatted-date'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import ChangeAlbumForm from '../change-album-form'

const useStyles = makeStyles({
  root: {
    width: '320px',
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
  imageWrapper: {
    '& img': {
      width: '100%',
      display: 'block'
    }
  },
  meta: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    color: '#FFF',
    padding: '0.5rem'
  },
  title: {
    fontWeight: 'bold',
    marginBottom: '0.25rem'
  },
  owner: {
    '&:hover $controls': {
      display: 'block'
    }
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'none',
    padding: '0.5rem'
  },
  show: {
    display: 'block'
  }
})

function truncateTextAndAddEllipsis(text) {
  return text && text.length >= 100 ? `${text.slice(0, 100)}...` : text
}

export default ({
  photo: {
    id,
    smallUrl,
    sourceUrl,
    title,
    description,
    albums = [],
    createdAt,
    createdBy
  }
}) => {
  const classes = useStyles()
  const cardRef = useRef()
  const userId = useFirebaseUserId()
  const [showControls, setShowControls] = useState(false)

  const isOwner = userId === createdBy.id

  return (
    <Card
      className={`${classes.root} ${isOwner ? classes.owner : ''}`}
      ref={cardRef}>
      <CardActionArea className={classes.actionArea}>
        <Link
          to={routes.viewPhotoWithVar.replace(':photoId', id)}
          className={classes.link}>
          <LazyLoad width={320} height={240}>
            <div className={classes.imageWrapper}>
              <img src={smallUrl || sourceUrl} alt="Image for photo" />
            </div>
          </LazyLoad>
          <div className={classes.meta}>
            <div className={classes.title}>{title}</div>
            {createdAt && (
              <div className={classes.date}>
                <FormattedDate date={createdAt} />
              </div>
            )}
          </div>
        </Link>
      </CardActionArea>
      {isOwner && (
        <div
          className={`${classes.controls} ${showControls ? classes.show : ''}`}>
          <ChangeAlbumForm
            photoId={id}
            existingAlbumRefs={albums}
            onOpen={() => setShowControls(true)}
            onClose={() => setShowControls(false)}
          />
        </div>
      )}
    </Card>
  )
}
