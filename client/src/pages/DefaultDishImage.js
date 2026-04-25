import React, { useEffect, useState } from 'react'
import axios from 'axios'
import URL from '../URL'
import '../styles/DefaultDishImage.css'

function DefaultDishImage() {
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
      setMessage(err.response?.data?.message || 'خطأ في تحميل الصورة')
    } finally {
      setIsLoading(false)
    }
  }

  async function updateImage() {
    if (!selectedFile || isUpdating) {
      setMessage('يرجى اختيار صورة أولاً')
      return
    }

    const formData = new FormData()
    formData.append('image', selectedFile)

    try {
      setIsUpdating(true)

      const res = await axios.put(
        `${URL}/settings/default-dish-image`,
        formData,
        {
          withCredentials: true
        }
      )

      setMessage(res.data.message)
      setCurrentImage(res.data.data.defaultDishImage || '')
      setSelectedFile(null)
    } catch (err) {
      console.log(err)
      setMessage(err.response?.data?.message || 'خطأ في تحديث الصورة')
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    loadImage()
  }, [])

  if (isLoading) return null

  return (
    <div className='form-page default-image-page'>
      <h1>الصورة التلقائية</h1>

      <div className='default-image-preview'>
        {currentImage ? (
          <img
            src={`${URL.replace(/\/api$/, '')}/imgs/${currentImage}`}
            alt='الصورة التلقائية'
          />
        ) : (
          <div className='empty-default-image'>
            لا توجد صورة تلقائية حالياً
          </div>
        )}
      </div>

      <form>
        <div className='row'>
          <div className='field'>
            <label>الصورة</label>
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
            {isUpdating ? 'جارٍ التغيير...' : 'تغيير الصورة'}
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
