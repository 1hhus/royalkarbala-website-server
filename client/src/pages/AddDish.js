import React, { useEffect, useState } from 'react'
import { BsChevronDown } from 'react-icons/bs'
import axios from 'axios'
import URL from '../URL'
import { useTranslation } from 'react-i18next'
function AddDish() {
  const [isDropdownActive, setIsDropdownActive] = useState(false)
  const [data,setData] = useState({
    names: [],
    description: [],
    price: 0,
    image: "",
    category: "",
    categoryValue:""
  })
  const {t,i18n} = useTranslation()
  
  function pushMultilingualData(content, language, key) {
    setData((prevData) => {
      const existingIndex = prevData[key].findIndex((item) => item.language === language);
  
      if (existingIndex !== -1) {
        const updatedNames = [...prevData[key]];
        updatedNames[existingIndex].value = content;
        return {
          ...prevData,
          [key]: updatedNames,
        };
      } else {
        return {
          ...prevData,
          [key]: [...prevData[key], { language, value: content }],
        };
      }
    });
  }

  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const  [error, setError] = useState("")
  const [categories, setCategories] = useState([])
  async function loadData() {
    await axios.get(`${URL}/category/`, {withCredentials:true})
                .then(res => {
                  setCategories(res.data.data)
                  console.log(res.data.data)
                  setIsLoading(false)
                })
                .catch(err => {
                  setError(err.response.data.message)
                  console.log(err)
                  setIsLoading(false)
                })
  }
  async function addItem(){
    const formData = new FormData()
    formData.append('names', JSON.stringify(data.names));
    formData.append('description', JSON.stringify(data.description));
    formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('categoryValue', data.categoryValue);
    formData.append('image', data.image);
    if(!isAdding){
      setIsAdding(true)
      await axios.post(`${URL}/menu/add-item`, formData, {withCredentials:true})    
              .then(res => {
                setError(res.data.message)
                setIsAdding(false)
                setTimeout(() => {
                  window.location.reload()
                }, 760);
              })
              .catch(err => {
                console.log(err)
                setIsAdding(false)
                setError(err.response.data.message)
              })
    }
  }
  const currentLang = i18n.language
  useEffect(() => {
    if(isLoading){
      loadData()
    }
  }, [isLoading])
  return (
    <div className='form-page'>
      <form>
        <div className='row'>
          <div className='field'>
            <label>{t('IMAGE')}</label>
            <input type='file' onChange={e => {
              setData(d => {
                return { ...d, image: e.target.files[0] }
              })
            }} required name='image' />
          </div>
        </div>
        <div className='row names-row'>
          <div className='field-container'>
            <label>{t('NAME_AR')}</label>
            <input type='text' name='ar-name' onChange={e => {
              pushMultilingualData(e.target.value, 'ar', "names")
            }} required />
          </div>
          <div className='field-container'>
            <label>{t('NAME_EN')}</label>
            <input type='text' name='en-name' onChange={e => {
              pushMultilingualData(e.target.value, 'en', "names")
            }} required />
          </div>
          <div className='field-container'>
            <label>{t('NAME_FA')}</label>
            <input type='text' name='fa-name' onChange={e => {
              pushMultilingualData(e.target.value, 'fa', "names")
            }} required />
          </div>
          <div className='field-container'>
            <label>{t('NAME_UR')}</label>
            <input type='text' name='ur-name' onChange={e => {
              pushMultilingualData(e.target.value, 'ur', "names")
            }} required />
          </div>
        </div>
        <div className='row names-row'>
          <div className='field-container'>
            <label>{t('DESC_AR')}</label>
            <textarea name='ar-desc' id='ar-desc' onChange={e => {
              pushMultilingualData(e.target.value, 'ar', "description")
            }} required></textarea>
          </div>
          <div className='field-container'>
            <label>{t('DESC_EN')}</label>
            <textarea name='ar-desc' id='ar-desc' onChange={e => {
              pushMultilingualData(e.target.value, 'en', "description")
            }} required></textarea>
          </div>
          <div className='field-container'>
            <label>{t('DESC_FA')}</label>
            <textarea name='ar-desc' id='ar-desc' onChange={e => {
              pushMultilingualData(e.target.value, 'fa', "description")
            }} required></textarea>
          </div>
          <div className='field-container'>
            <label>{t('DESC_UR')}</label>
            <textarea name='ar-desc' id='ar-desc' onChange={e => {
              pushMultilingualData(e.target.value, 'ur', "description")
            }} required></textarea>
          </div>
        </div>
        <div className='row two-cols'>
          <div className='field-container'>
            <label>{t('PRICE')}</label>
            <input type='number' name='price' min={0} required onChange={e => {
              setData(d => {
                return { ...d, price: e.target.value }
              })
            }} />
          </div>
          <div className='field-container relatived' onClick={() => { setIsDropdownActive(!isDropdownActive) }}>
            <label>{t('CATEGORY')}</label>
            <input type='text' value={data.categoryValue} name='category' required disabled />
            <BsChevronDown className='icon' style={{ transform: isDropdownActive ? "rotate(180deg)" : 'rotate(0)' }} />
            <div className={isDropdownActive ? 'dropdown active' : 'dropdown'}>
              <ul>
                {
                  categories.map((category, i) => {
                    return <li key={i} onClick={() => {
                      setIsDropdownActive(false)
                      setData(d => {
                        return { ...d, category: category._key, categoryValue:category.names.find(n => n.language === currentLang).value }
                      })
                    }}>{category.names.find(n => n.language === currentLang).value}</li>
                  })
                }
              </ul>
            </div>
          </div>
        </div>
        <div className='row'>
          <button onClick={e => {
            e.preventDefault()
            addItem()
          }}>{isAdding ? t('loading') : t('Add Dish')}</button>
        </div>
      </form>
      <div className='errors-container'>
        <p>
          {error}
        </p>
      </div>
    </div>
  )
}

export default AddDish