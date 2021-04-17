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
import DeleteIcon from '@material-ui/icons/Delete'

import * as routes from '../../routes'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import placeholderUrl from '../../assets/images/placeholder-photo.webp'

import ChangeAlbumForm from '../change-album-form'
import FormattedDate from '../formatted-date'
import TogglePrivacyBtn from '../toggle-privacy-btn'
import ToggleIsAdult from '../toggle-is-adult'
import { PhotoFieldNames, PhotoStatuses, PhotoPrivacies } from '../../firestore'
import ToggleDeleteBtn from '../toggle-delete-btn'

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
  deleted: {
    opacity: 0.5
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
    },
    overflow: 'hidden'
  },
  adult: {
    filter: 'blur(5px)',
    transform: 'scale(1.1)'
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
  controlItems: {
    display: 'flex'
  },
  control: {
    marginRight: '0.25rem'
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
  },
  adultMessage: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#FFF',
    textShadow: '1px 1px 1px #000'
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
    [PhotoFieldNames.isAdult]: isAdult,
    [PhotoFieldNames.status]: status,
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
      className={`${classes.root} ${isOwner ? classes.owner : ''} ${
        status === PhotoStatuses.Deleted ? classes.deleted : ''
      }`}
      ref={cardRef}>
      <CardActionArea className={classes.actionArea}>
        <Link
          to={routes.viewPhotoWithVar.replace(':photoId', id)}
          className={classes.link}>
          <LazyLoad width={320} height={240}>
            <div className={`${classes.imageWrapper}`}>
              <img
                src={placeholderUrl}
                className={`${classes.placeholder} ${
                  isAdult ? classes.adult : ''
                }`}
                alt="Placeholder photo"
              />
              <img
                src={smallUrl || sourceUrl}
                alt="Image for photo"
                className={`${classes.actualPhoto} ${
                  isAdult ? classes.adult : ''
                }`}
              />
              {isAdult && (
                <div className={classes.adultMessage}>Adult Content</div>
              )}
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
          <div className={classes.controlItems}>
            <div className={classes.control}>
              <ChangeAlbumForm
                photoId={id}
                existingAlbumRefs={albums}
                onOpen={() => setShowControls(true)}
                onClose={() => setShowControls(false)}
                hideLabel
              />
            </div>
            <div className={classes.control}>
              <TogglePrivacyBtn
                photoId={id}
                currentPrivacy={privacy}
                hideLabel
              />
            </div>
            <div className={classes.control}>
              <ToggleDeleteBtn photoId={id} currentStatus={status} hideLabel />
            </div>
            <div className={classes.control}>
              <ToggleIsAdult photoId={id} currentIsAdult={isAdult} hideLabel />
            </div>
          </div>
        </div>
      )}
      <div className={classes.icons}>
        {privacy === PhotoPrivacies.Private ? <VisibilityOffIcon /> : null}
        {status === PhotoStatuses.Deleted ? <DeleteIcon /> : null}
      </div>
    </Card>
  )
}
