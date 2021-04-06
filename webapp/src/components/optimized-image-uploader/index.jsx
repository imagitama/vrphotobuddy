import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import Button from '../button'
import useFileUpload from '../../hooks/useFileUpload'
import BodyText from '../body-text'
import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import defaultAvatarUrl from '../../assets/images/default-avatar.png'
import { usingEmulator } from '../../environment'

const useStyles = makeStyles({
  root: {
    padding: '1rem'
  },
  container: {
    position: 'relative'
  },
  input: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    zIndex: 100
  }
})

function renameFileExtToPng(path) {
  return path
    .replace('.jpeg', '.png')
    .replace('.jpg', '.png')
    .replace('.webp', '.png')
}

function Output({
  onUploadedUrl,
  requiredWidth = null,
  requiredHeight = null,
  directoryPath = '',
  filePrefix = '',
  children = null,
  preloadImageUrl = null,
  preloadFile = null
}) {
  const classes = useStyles()
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [imageSrc, setImageSrc] = useState(preloadImageUrl)
  const [isUploading, percentageDone, , , upload] = useFileUpload()
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const imageRef = useRef()
  const selectedFileRef = useRef(preloadFile)
  const [croppedImagePreviewUrl, setCroppedImagePreviewUrl] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isErrored, setIsErrored] = useState(false)
  const throttleTimeoutRef = useRef()
  const onImageLoadedTimeoutRef = useRef()

  useEffect(() => {
    if (!imageRef.current) {
      return
    }

    async function main() {
      try {
        const canvas = await cropImageElementAndGetCanvas()
        const url = canvas.toDataURL('image/jpeg')
        setCroppedImagePreviewUrl(url)
      } catch (err) {
        console.error('Failed to generate cropped image preview url', err)
        handleError(err)
      }
    }
    main()
  }, [cropX, cropY, width, height])

  useEffect(() => {
    return () => {
      clearTimeout(throttleTimeoutRef.current)
      clearTimeout(onImageLoadedTimeoutRef.current)
    }
  }, [])

  const onFileChange = files => {
    const reader = new FileReader()
    const selectedFile = files[0]
    selectedFileRef.current = selectedFile

    reader.addEventListener('load', () => {
      setImageSrc(reader.result)
    })

    reader.readAsDataURL(selectedFile)
  }

  const onCancelBtnClick = () => {
    selectedFileRef.current = null
    setImageSrc(null)
    setUploadedUrl(null)
    setIsOptimizing(false)
    setIsErrored(false)
  }

  const onCropChange = newCrop => {
    clearTimeout(throttleTimeoutRef.current)

    throttleTimeoutRef.current = setTimeout(() => {
      // If you store the whole object it invalidates a dep and causes infinite loop
      setCropX(newCrop.x)
      setCropY(newCrop.y)
      setWidth(newCrop.width)
      setHeight(newCrop.height)
    }, 5)
  }

  const cropImageElementAndGetCanvas = async () => {
    return new Promise(resolve => {
      const image = imageRef.current

      const canvas = document.createElement('canvas')
      canvas.width = requiredWidth || image.width
      canvas.height = requiredHeight || image.height

      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(
        image,
        cropX * scaleX,
        cropY * scaleY,
        width * scaleX,
        height * scaleY,
        0,
        0,
        requiredWidth || image.width,
        requiredHeight || image.height
      )
      resolve(canvas)
    })
  }

  const cropImageElementAndGetBlob = async (asJpeg = false) => {
    const canvas = await cropImageElementAndGetCanvas()

    return new Promise(resolve => {
      // PNG is way slower to use JPEG for previews
      if (asJpeg) {
        canvas.toBlob(resolve, 'image/jpeg', 1)
      } else {
        canvas.toBlob(resolve)
      }
    })
  }

  const onPerformCropBtnClick = async () => {
    try {
      const blob = await cropImageElementAndGetBlob()

      const filename = `${
        filePrefix ? `${filePrefix}___` : ''
      }${renameFileExtToPng(selectedFileRef.current.name)}`
      const fileToUpload = new File([blob], filename)

      const uploadPath = `${directoryPath}/${filename}`

      console.debug(`Upload ${uploadPath}`)

      if (usingEmulator()) {
        console.debug('using emulator so skipping upload...')
        setUploadedUrl(defaultAvatarUrl)
        onUploadedUrl(defaultAvatarUrl)
        return
      }

      const uploadedUrl = await upload(fileToUpload, uploadPath)

      setIsOptimizing(true)

      const {
        data: { optimizedImageUrl }
      } = await callFunction('optimizeImage', {
        imageUrl: uploadedUrl
      })

      setIsOptimizing(false)
      setUploadedUrl(uploadedUrl)

      onUploadedUrl(optimizedImageUrl)
    } catch (err) {
      console.error('Failed to crop image', err)
      handleError(err)
      setIsErrored(true)
    }
  }

  if (isErrored) {
    return (
      <>
        An error has occurred. Please try again
        <br />
        <Button onClick={onCancelBtnClick} color="default">
          Try Again
        </Button>
      </>
    )
  }

  if (isOptimizing) {
    return 'Optimizing image...'
  }

  if (uploadedUrl) {
    return (
      <>
        <img src={uploadedUrl} width="100%" alt="Uploaded preview" />
        <Button onClick={onCancelBtnClick} color="default">
          Try Again
        </Button>
      </>
    )
  }

  if (isUploading) {
    return `Uploading ${parseInt(percentageDone)}%...`
  }

  if (!imageSrc) {
    if (children) {
      return (
        <div className={classes.container}>
          <input
            className={classes.input}
            type="file"
            onChange={event => onFileChange(event.target.files)}
            multiple={false}
          />
          {children}
        </div>
      )
    }

    return (
      <>
        <BodyText>
          Select a JPG/PNG/WEBP and you will be able to crop it
        </BodyText>
        <input
          type="file"
          onChange={event => onFileChange(event.target.files)}
          accept="image/png,image/jpeg,image/webp"
        />
      </>
    )
  }

  return (
    <>
      Now crop the image:
      <div style={{ width: '100%' }}>
        <ReactCrop
          src={imageSrc}
          onChange={onCropChange}
          onImageLoaded={img => {
            imageRef.current = img
            imageRef.current.crossOrigin = 'anonymous' // allow us to render cross-domain images like Gumroad

            // need this delay because it is needed apparently
            onImageLoadedTimeoutRef.current = setTimeout(() => {
              onCropChange({
                x: 0,
                y: 0,
                width: requiredWidth || img.width,
                height: requiredHeight || img.height
              })
            }, 50)
          }}
          crop={{
            x: cropX,
            y: cropY,
            width: width ? width : undefined,
            height: height ? height : 100,
            lock: true,
            aspect:
              requiredWidth && requiredHeight
                ? requiredWidth / requiredHeight
                : undefined,
            unit: width && height ? 'px' : '%'
          }}
        />
      </div>
      Output:
      <img
        src={croppedImagePreviewUrl}
        width={requiredWidth || width}
        height={requiredHeight || height}
        alt="Uploaded preview"
      />
      <br />
      <Button onClick={onCancelBtnClick} color="default">
        Cancel
      </Button>
      <Button onClick={onPerformCropBtnClick}>Submit</Button>
    </>
  )
}

export default props => {
  const classes = useStyles()

  if (props.children || props.noPaper) {
    return <Output {...props} />
  }

  return (
    <Paper className={classes.root}>
      <Output {...props} />
    </Paper>
  )
}
