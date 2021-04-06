import React, { useState } from 'react'
import Lightbox from 'react-image-lightbox'
import { makeStyles } from '@material-ui/core/styles'
import 'react-image-lightbox/style.css'

const useStyles = makeStyles({
  thumbnail: {
    maxHeight: 200,
    maxWidth: '100%',
    margin: '0 0.5rem 0.5rem 0',
    '&:hover': { cursor: 'pointer ' }
  }
})

function getSrcForIndex(index, urls) {
  const urlOrUrls = urls[index]
  return urlOrUrls
}

export default ({
  urls,
  onOpen = null,
  onMoveNext = null,
  onMovePrev = null
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const classes = useStyles()

  function onThumbnailClick(idx) {
    setActivePhotoIdx(idx)
    setIsOpen(true)
    if (onOpen) {
      onOpen()
    }
  }

  return (
    <div>
      {isOpen && (
        <Lightbox
          mainSrc={getSrcForIndex(activePhotoIdx, urls)}
          nextSrc={getSrcForIndex((activePhotoIdx + 1) % urls.length, urls)}
          prevSrc={getSrcForIndex(
            (activePhotoIdx + urls.length - 1) % urls.length,
            urls
          )}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() => {
            setActivePhotoIdx((activePhotoIdx + urls.length - 1) % urls.length)
            if (onMovePrev) {
              onMovePrev()
            }
          }}
          onMoveNextRequest={() => {
            setActivePhotoIdx((activePhotoIdx + 1) % urls.length)
            if (onMoveNext) {
              onMoveNext()
            }
          }}
        />
      )}
      {urls.map((url, idx) => (
        <picture key={url}>
          <img
            key={url}
            src={url}
            onClick={() => onThumbnailClick(idx)}
            className={classes.thumbnail}
            alt={`Thumbnail ${idx}`}
          />
        </picture>
      ))}
    </div>
  )
}
