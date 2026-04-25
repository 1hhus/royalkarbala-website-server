import React from 'react'
import '../styles/LanguageAlert.css'
import { useTranslation } from 'react-i18next'
function LanuageAlert(props) {
    const {i18n} = useTranslation()
  function changeLanguage(value){
    i18n.changeLanguage(value)
    localStorage.setItem('language', value)
    window.location.reload()
  }
  const languages = [
    {
      text:"العربية",
      val:'ar'
    },{
      text:"English",
      val:'en'
    },{
      text:"فارسى",
      val:'fa'
    },{
      text:"اردو",
      val:'ur'
    },
]
  return (
    <div className={props.isActive ? 'language-alert active' : 'language-alert'}>
        <div className='desc'>
            <h2>Please, Choose Language</h2>
        </div>
        <div className='languages'>
            {
                languages.map((lang, key) => {
                    return (
                    <button key={key} onClick={() => {
                        changeLanguage(lang.val)
                    }}>{lang.text}</button>
                )
                })
            }
        </div>
    </div>
  )
}

export default LanuageAlert