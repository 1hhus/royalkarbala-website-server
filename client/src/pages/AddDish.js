import React, { useEffect, useState } from 'react'
import { BsChevronDown } from 'react-icons/bs'
import axios from 'axios'
import URL from '../URL'
import { useTranslation } from 'react-i18next'

function AddDish() {
  const [isDropdownActive, setIsDropdownActive] = useState(false)

  const [data, setData] = useState({
    names: [],
    description: [],
    price: 0,
    image: '',
    category: '',
    categoryValue: ''
  })

  const { t, i18n } = useTranslation()
  const currentLang = i18n.language

  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])

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
      const res = await axios.get(`${URL}/category/`, {
        withCredentials: true
      })

      const sortedCategories = res.data.data.sort((a, b) => a.order - b.order)
      setCategories(sortedCategories)
    } catch (err) {
      console.log(err)
      setError(t('Error loading categories'))
    } finally {
      setIsLoading(false)
    }
  }

  async function addItem() {
    if (isAdding) return

    const formData = new FormData()

    formData.append('names', JSON.stringify(data.names))
    formData.append('description', JSON.stringify(data.description))
    formData.append('price', data.price)
    formData.append('category', data.category)
    formData.append('categoryValue', data.categoryValue)

    if (data.image) {
      formData.append('image', data.image)
    }

    try {
      setIsAdding(true)

      const res = await axios.post(`${URL}/menu/add-item`, formData, {
        withCredentials: true
      })

      setError(res.data.message || t('success'))

      setTimeout(() => {
        window.location.reload()
      }, 760)
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.message || t('Error adding dish'))
    } finally {
      setIsAdding(false)
    }
  }

  useEffect(() => {
    if (isLoading) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  if (isLoading) {
    return null
  }

  return (
    <div className='form-page add-dish-container'>
      <form>
        <div className='row'>
          <div className='field'>
            <label>{t('IMAGE')}</label>

            <input
              type='file'
              onChange={e => {
                setData(d => ({
                  ...d,
                  image: e.target.files[0] || ''
                }))
              }}
              name='image'
            />
          </div>
        </div>

        <div className='row names-row'>
          <div className='field-container'>
            <label>{t('NAME_AR')}</label>
            <input
              type='text'
              onChange={e => {
                pushMultilingualData(e.target.value, 'ar', 'names')
              }}
              required
            />
          </div>

          <div className='field-container'>
            <label>{t('NAME_EN')}</label>
            <input
              type='text'
              onChange={e => {
                pushMultilingualData(e.target.value, 'en', 'names')
              }}
              required
            />
          </div>

          <div className='field-container'>
            <label>{t('NAME_FA')}</label>
            <input
              type='text'
              onChange={e => {
                pushMultilingualData(e.target.value, 'fa', 'names')
              }}
              required
            />
          </div>

          <div className='field-container'>
            <label>{t('NAME_UR')}</label>
            <input
              type='text'
              onChange={e => {
                pushMultilingualData(e.target.value, 'ur', 'names')
              }}
              required
            />
          </div>
        </div>

        <div className='row names-row'>
          <div className='field-container'>
            <label>{t('DESC_AR')}</label>
            <textarea
              onChange={e => {
                pushMultilingualData(e.target.value, 'ar', 'description')
              }}
              required
            ></textarea>
          </div>

          <div className='field-container'>
            <label>{t('DESC_EN')}</label>
            <textarea
              onChange={e => {
                pushMultilingualData(e.target.value, 'en', 'description')
              }}
              required
            ></textarea>
          </div>

          <div className='field-container'>
            <label>{t('DESC_FA')}</label>
            <textarea
              onChange={e => {
                pushMultilingualData(e.target.value, 'fa', 'description')
              }}
              required
            ></textarea>
          </div>

          <div className='field-container'>
            <label>{t('DESC_UR')}</label>
            <textarea
              onChange={e => {
                pushMultilingualData(e.target.value, 'ur', 'description')
              }}
              required
            ></textarea>
          </div>
        </div>

        <div className='row two-cols'>
          <div className='field-container'>
            <label>{t('PRICE')}</label>

            <input
              type='number'
              min={0}
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
                  ?.names?.find(n => n.language === currentLang)?.value || ''
              }
              required
            />

            <BsChevronDown
              className='icon'
              style={{
                transform: isDropdownActive ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />

            <div className={isDropdownActive ? 'dropdown active' : 'dropdown'}>
              <ul>
                {categories.map(category => (
                  <li
                    key={category._key}
                    onClick={() => {
                      setIsDropdownActive(false)
                      setData(d => ({
                        ...d,
                        category: category._key,
                        categoryValue:
                          category.names.find(n => n.language === currentLang)?.value || ''
                      }))
                    }}
                  >
                    {category.names.find(n => n.language === currentLang)?.value}
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
              addItem()
            }}
          >
            {isAdding ? t('loading') : t('Add Dish')}
          </button>
        </div>
      </form>

      <div className='errors-container'>
        <p>{error}</p>
      </div>
    </div>
  )
}

export default AddDish
