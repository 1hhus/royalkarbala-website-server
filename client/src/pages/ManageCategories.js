import React, { useEffect, useState } from 'react'
import axios from 'axios'
import URL from '../URL'
import { useTranslation } from 'react-i18next'

function ManageCategories() {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language

  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [data, setData] = useState({
    names: []
  })

  function pushMultilingualData(content, language) {
    setData(prev => {
      const existingIndex = prev.names.findIndex(n => n.language === language)

      if (existingIndex !== -1) {
        const updated = [...prev.names]
        updated[existingIndex].value = content

        return { ...prev, names: updated }
      }

      return {
        ...prev,
        names: [...prev.names, { language, value: content }]
      }
    })
  }

  async function loadCategories() {
    try {
      const res = await axios.get(`${URL}/category/all`, {
        withCredentials: true
      })

      const sorted = res.data.data.sort((a, b) => a.order - b.order)
      setCategories(sorted)
    } catch (err) {
      console.log(err)
      setError(t('Error loading categories'))
    } finally {
      setIsLoading(false)
    }
  }

  async function addCategory(e) {
    e.preventDefault()

    if (data.names.length === 0) {
      setError(t('Field required'))
      return
    }

    try {
      const res = await axios.post(`${URL}/category/add`, data, {
        withCredentials: true
      })

      setError(res.data.message || t('success'))

      setTimeout(() => {
        window.location.reload()
      }, 700)
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.message || t('An error occurred'))
    }
  }

  async function deleteCategory(id) {
    try {
      await axios.delete(`${URL}/category/${id}/delete`, {
        withCredentials: true
      })

      setError(t('delete'))

      setCategories(prev => prev.filter(c => c._key !== id))
    } catch (err) {
      console.log(err)
      setError(t('An error occurred'))
    }
  }

  useEffect(() => {
    loadCategories()
    // eslint-disable-next-line
  }, [])

  if (isLoading) return null

  return (
    <div className='form-page'>
      <h1>{t('Manage Categories')}</h1>

      <form onSubmit={addCategory}>
        <div className='row'>
          {['ar', 'en', 'fa', 'ur'].map(lang => (
            <div className='field-container' key={lang}>
              <label>{t(`Category Name (${lang === 'ar' ? 'Arabic' : lang === 'en' ? 'English' : lang === 'fa' ? 'Persian' : 'Urdu'})`)}</label>

              <input
                type='text'
                onChange={e => pushMultilingualData(e.target.value, lang)}
                required
              />
            </div>
          ))}
        </div>

        <div className='row'>
          <button type='submit'>{t('Add')}</button>
        </div>
      </form>

      <div className='categories-list'>
        {categories.map(category => (
          <div className='category-item' key={category._key}>
            <span>
              {category.names.find(n => n.language === currentLanguage)?.value}
            </span>

            <button onClick={() => deleteCategory(category._key)}>
              {t('delete')}
            </button>
          </div>
        ))}
      </div>

      <div className='errors-container'>
        <p>{error}</p>
      </div>
    </div>
  )
}

export default ManageCategories
