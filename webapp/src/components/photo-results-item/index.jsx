import React, { useRef } from 'react'
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
  }
})

function truncateTextAndAddEllipsis(text) {
  return text && text.length >= 100 ? `${text.slice(0, 100)}...` : text
}

export default ({
  photo: { id, sourceUrl, title, description, createdAt }
}) => {
  const classes = useStyles()
  const cardRef = useRef()

  return (
    <Card className={classes.root} ref={cardRef}>
      <CardActionArea className={classes.actionArea}>
        <Link
          to={routes.viewPhotoWithVar.replace(':photoId', id)}
          className={classes.link}>
          <LazyLoad width={320} height={240}>
            <div className={classes.imageWrapper}>
              <img src={sourceUrl} alt="Image for photo" />
            </div>
          </LazyLoad>
          <div className={classes.meta}>
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
          </div>
        </Link>
      </CardActionArea>
    </Card>
  )
}
