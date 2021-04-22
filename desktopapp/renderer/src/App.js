import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import logo from './logo.svg'
import './App.css'
import { getPhotos, uploadSelectedPhotos, waitForNewPhotos } from './electron'

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

function App() {
  const [photos, setPhotos] = useState([])
  const [selectedPhotoIndexes, setSelectedPhotoIndexes] = useState([])
  const [isGettingPhotos, setIsGettingPhotos] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadSuccess, setIsUploadSuccess] = useState(false)
  const [lastError, setLastError] = useState(null)
  const [numberOfUploadedPhotos, setNumberOfUploadedPhotos] = useState(0)

  useEffect(() => {
    ; (async () => {
      waitForNewPhotos((newPhotos) => {
        setPhotos(currentVal => currentVal.concat(newPhotos))

        // reset
        setIsUploadSuccess(false)
        setLastError(null)
        setNumberOfUploadedPhotos(0)
      })
    })()
  }, [])

  useEffect(() => {
    ; (async () => {
      try {
        setIsGettingPhotos(true)
        const result = await getPhotos()
        setPhotos(result)
        setIsGettingPhotos(false)
      } catch (err) {
        console.error(err)
        setIsGettingPhotos(false)
        setLastError(err)
      }
    })()
  }, [])

  const upload = async () => {
    try {
      setIsUploading(true)
      setIsUploadSuccess(false)
      const photosToUpload = photos.filter((photo, idx) => selectedPhotoIndexes.includes(idx))
      await uploadSelectedPhotos(photosToUpload)
      setNumberOfUploadedPhotos(photosToUpload.length)
      setPhotos([])
      setSelectedPhotoIndexes([])
      setIsUploading(false)
      setIsUploadSuccess(true)
    } catch (err) {
      console.error(err)
      setIsUploading(false)
      setLastError(err)
    }
  }

  if (isUploadSuccess) {
    return `Upload of ${numberOfUploadedPhotos} photos was a success - you can now close this window`
  }

  if (isUploading) {
    return `Uploading ${selectedPhotoIndexes.length} photos...`
  }

  if (isGettingPhotos) {
    return 'Loading photos...'
  }

  if (lastError) {
    return `Error detected: ${lastError.message}`
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="App">
        <h1>VR Photo Buddy</h1>
        <p>
          These photos were detected as being taken while you were playing VRChat. Check the box next to each one you want to upload then click Upload.
      </p>
        {photos.length
          ? photos.map((photoPath, idx) => {
            const isSelected = selectedPhotoIndexes.includes(idx)
            const toggleSelected = () => setSelectedPhotoIndexes(currentVal => {
              if (isSelected) {
                return currentVal.filter(item => item !== idx)
              } else {
                return currentVal.concat([idx])
              }
            })

            return (
              <div className="photo">
                <img src={photoPath} width={500} onClick={toggleSelected} />
                <div>
                  <Checkbox checked={isSelected} onChange={toggleSelected} />
                </div>
              </div>
            )
          })
          : 'Waiting...'}
        <div className="controls">
          <Button disabled={!photos.length} onClick={upload} variant="contained" color="primary">Upload</Button>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
