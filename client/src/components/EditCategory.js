import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import URL from '../URL'
function EditCategory(props) {
    const {t, i18n} = useTranslation()
    const currentLang = i18n.language
    const [data, setData] = useState(null)
    useEffect(() => {
        setData(props.data)
    }, [props.data])

    function changeVal(key, val) {
        setData((prevData) => {
            return {
                ...prevData,
                names: prevData.names.map((item) =>
                    item.language === key ? { ...item, value: val } : item
                ),
            };
        });
    }
    const [isLoading, setIsLoading] = useState(false)
    async function edit(){
        setIsLoading(true)
        await axios.put(`${URL}/category/${data._key}/edit`, data, {withCredentials:true})
                    .then(res => {
                        console.log(res)
                        if(res.status === 200){
                            window.location.reload()
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    })
    }

  return data ? (
    <div className={props.activity ? 'edit-category active' : 'edit-category'}>
        <div>
            {
                props.data ? <h1>تعديل الفئة {props.data.names.find(n => n.language === currentLang).value}</h1> : ""
            }
        </div>
        <form>
            <div className='row grid-4'>
            {
                ['ar', 'en', 'fa', 'ur'].map((lang, i) => {
                    return  (
                        <div className='field-container' key={i}>
                            <label>{t(`NAME_${lang.toUpperCase()}`)}</label>
                            <input name={lang} id={lang} className='field' value={data?.names.find(n => n.language === lang).value}  onChange={e => {
                                changeVal(lang, e.target.value)
                            }}/>
                        </div>
                    )
                })
            }
            </div>
            <div className='options-btns'>
                <button onClick={(e) => {
                    e.preventDefault()
                    edit()
                }}>{isLoading ? t("loading") : t("edit")}</button>
                <button onClick={e => {
                    e.preventDefault()
                    props.cancel()
                }}>{t("no_cancel")}</button>
            </div>
        </form>
    </div>
  ) : ""
}

export default EditCategory