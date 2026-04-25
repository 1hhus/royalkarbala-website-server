import React, { useEffect, useState } from 'react'
import axios from 'axios'
import URL from '../URL'
import { useTranslation } from 'react-i18next'
import '../styles/DefaultDishImage.css'

function DefaultDishImage() {
  const { t } = useTranslation()

  const [currentImage, setCurrentImage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  async function loadImage() {
    try {
      const res = await axios.get(`${URL}/settings/default-dish-image`, {
        withCredentials: true
      })

      setCurrentImage(res.data.data.defaultDishImage || '')
    } catch (err) {
      console.log(err)
      setMessage(t('Error loading image'))
    } finally {
      setIsLoading(false)
    }
  }

  async function updateImage() {
    if (!selectedFile || isUpdating) {
      setMessage(t('Please choose an image first'))
      return
    }

    const formData = new FormData()
    formData.append('image', selectedFile)

    try {
      setIsUpdating(true)

      const res = await axios.put(
        `${URL}/settings/default-dish-image`,
        formData,
        { withCredentials: true }
      )

      setMessage(t('Image updated successfully'))
      setCurrentImage(res.data.data.defaultDishImage || '')
      setSelectedFile(null)
    } catch (err) {
      console.log(err)
      setMessage(t('Error updating image'))
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    loadImage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) return null

  return (
    <div className='form-page default-image-page'>
      <h1>{t('Default Image')}</h1>

      <div className='default-image-preview'>
        {currentImage ? (
          <img
            src={`${URL.replace(/\/api$/, '')}/imgs/${currentImage}`}
            alt={t('Default Image')}
          />
        ) : (
          <div className='empty-default-image'>
            {t('No default image currently')}
          </div>
        )}
      </div>

      <form>
        <div className='row'>
          <div className='field'>
            <label>{t('IMAGE')}</label>
            <input
              type='file'
              name='image'
              onChange={e => {
                setSelectedFile(e.target.files[0] || null)
              }}
            />
          </div>
        </div>

        <div className='row'>
          <button
            onClick={e => {
              e.preventDefault()
              updateImage()
            }}
          >
            {isUpdating ? t('Changing...') : t('Change Image')}
          </button>
        </div>
      </form>

      <div className='errors-container'>
        <p>{message}</p>
      </div>
    </div>
  )
}

export default DefaultDishImage
