import React, { useEffect, useState } from 'react'
import { BsChevronDown } from 'react-icons/bs'
import axios from 'axios'
import URL from '../URL'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import '../styles/EditDish.css'

function EditDish() {
  const [isDropdownActive, setIsDropdownActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [currentImage, setCurrentImage] = useState('')
  const [error, setError] = useState('')

  const [data, setData] = useState({
    names: [],
    description: [],
    price: 0,
    image: '',
    category: '',
    categoryValue: ''
  })

  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language

  const params = useParams()
  const id = params.id

  function pushMultilingualData(content, language, key) {
    setData(prevData => {
      const existingIndex = prevData[key].findIndex(item => item.language === language)

      if (existingIndex !== -1) {
        const updatedValues = [...prevData[key]]
        updatedValues[existingIndex].value = content

        return {
          ...prevData,
          [key]: updatedValues
        }
      }

      return {
        ...prevData,
        [key]: [...prevData[key], { language, value: content }]
      }
    })
  }

  async function loadData() {
    try {
      const dishRes = await axios.get(`${URL}/menu/${id}`, {
        withCredentials: true
      })

      setData(dishRes.data.data)
      setCurrentImage(dishRes.data.data.image)

      const categoryRes = await axios.get(`${URL}/category/all`, {
        withCredentials: true
      })

      const sortedCategories = categoryRes.data.data.sort((a, b) => a.order - b.order)
      setCategories(sortedCategories)
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isLoading) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, id])

  const handleImageUpload = async (dishId, file) => {
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await axios.put(
        `${URL}/menu/${dishId}/update-image`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setError(response.data.message)
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Error uploading image')
    }
  }

  async function edit(formData) {
    await axios.put(`${URL}/menu/${id}/edit`, formData, { withCredentials: true })
      .then(res => {
        setError(res.data.message)

        if (res.status === 200 && currentImage === formData.image) {
          window.location.reload()
        }
      })
      .catch(err => {
        console.log(err)
        setError(err.response?.data?.message || 'An error occurred')
      })

    if (formData.image instanceof File) {
      await handleImageUpload(id, formData.image)
    }
  }

  if (isLoading) return null

  return (
    <div className='form-page edit-dish-container'>
      <div className='image-preview'>
        <img
          src={`${URL.replace(/\/api$/, '')}/imgs/${currentImage}`}
          loading='lazy'
          alt={data.names[0]?.value || ''}
        />
      </div>

      <form>
        <div className='row'>
          <div className='field'>
            <label>{t('IMAGE')}</label>
            <input
              type='file'
              onChange={e => {
                setData(d => ({
                  ...d,
                  image: e.target.files[0]
                }))
              }}
              name='image'
            />
          </div>
        </div>

        <div className='row names-row'>
          {['ar', 'en', 'fa', 'ur'].map(lang => (
            <div className='field-container' key={lang}>
              <label>{t(`NAME_${lang.toUpperCase()}`)}</label>
              <input
                type='text'
                value={data.names.find(d => d.language === lang)?.value || ''}
                onChange={e => {
                  pushMultilingualData(e.target.value, lang, 'names')
                }}
                required
              />
            </div>
          ))}
        </div>

        <div className='row names-row'>
          {['ar', 'en', 'fa', 'ur'].map(lang => (
            <div className='field-container' key={lang}>
              <label>{t(`DESC_${lang.toUpperCase()}`)}</label>
              <textarea
                value={data.description.find(d => d.language === lang)?.value || ''}
                onChange={e => {
                  pushMultilingualData(e.target.value, lang, 'description')
                }}
                required
              />
            </div>
          ))}
        </div>

        <div className='row two-cols'>
          <div className='field-container'>
            <label>{t('PRICE')}</label>
            <input
              type='number'
              min={0}
              value={data.price}
              onChange={e => {
                setData(d => ({
                  ...d,
                  price: e.target.value
                }))
              }}
              required
            />
          </div>

          <div
            className='field-container relatived'
            onClick={() => {
              setIsDropdownActive(!isDropdownActive)
            }}
          >
            <label>{t('CATEGORY')}</label>
            <input
              type='text'
              disabled
              value={
                categories.find(d => d._key === data.category)
                  ?.names?.find(n => n.language === currentLanguage)?.value || ''
              }
            />

            <BsChevronDown
              className='icon'
              style={{
                transform: isDropdownActive ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />

            <div className={isDropdownActive ? 'dropdown active' : 'dropdown'}>
              <ul>
                {categories.map((category) => (
                  <li
                    key={category._key}
                    onClick={() => {
                      setIsDropdownActive(false)
                      setData(d => ({
                        ...d,
                        category: category._key,
                        categoryValue: category.name
                      }))
                    }}
                  >
                    {category.names.find(n => n.language === currentLanguage)?.value}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className='row'>
          <button
            onClick={e => {
              e.preventDefault()
              edit(data)
            }}
          >
            {t('Done')}
          </button>
        </div>
      </form>

      <div className='errors-container'>
        <p>{error}</p>
      </div>
    </div>
  )
}

export default EditDish
