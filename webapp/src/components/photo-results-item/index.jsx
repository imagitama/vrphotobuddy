import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import LazyLoad from 'react-lazyload'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff'

import * as routes from '../../routes'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import placeholderUrl from '../../assets/images/placeholder-photo.webp'

import ChangeAlbumForm from '../change-album-form'
import FormattedDate from '../formatted-date'
import TogglePrivacyBtn from '../toggle-privacy-btn'
import { PhotoFieldNames } from '../../firestore'

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
    position: 'relative',
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
  },
  actualPhoto: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  icons: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '0.5rem'
  }
})

// function truncateTextAndAddEllipsis(text) {
//   return text && text.length >= 100 ? `${text.slice(0, 100)}...` : text
// }

export default ({
  photo: {
    id,
    smallUrl,
    sourceUrl,
    title,
    albums = [],
    [PhotoFieldNames.privacy]: privacy,
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
              <img
                src={placeholderUrl}
                className={classes.placeholder}
                alt="Placeholder photo"
              />
              <img
                src={smallUrl || sourceUrl}
                alt="Image for photo"
                className={classes.actualPhoto}
              />
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
            hideLabel
          />{' '}
          <TogglePrivacyBtn photoId={id} currentPrivacy={privacy} hideLabel />
        </div>
      )}
      {privacy === 1 ? (
        <div className={classes.icons}>
          <VisibilityOffIcon />
        </div>
      ) : null}
    </Card>
  )
}
