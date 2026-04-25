import React, { useEffect, useState } from 'react'
import '../styles/Navbar.css'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'

const languages = {
  ar: "العربية",
  en: "English",
  fa: "فارسى",
  ur: "اردو",
}

function Navbar() {
  const [isSidebarActive, setIsSidebarActive] = useState(false)
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState("العربية")

  function setLocalStorage(value) {
    localStorage.setItem('language', value)
  }

  useEffect(() => {
    const language = localStorage.getItem("language")
    if (language && languages[language]) {
      setCurrentLanguage(languages[language])
    } else {
      setCurrentLanguage("العربية")
    }
  }, [])

  function toggleSidebar(state) {
    if (state) {
      gsap.to("header nav", {
        x: 0,
        duration: 1.5,
        overwrite: true,
        ease: 'expo.out'
      })
    } else {
      gsap.to("header nav", {
        x: '-150%',
        duration: 1,
        overwrite: true,
        ease: 'expo.inOut'
      })
    }
  }

  useEffect(() => {
    toggleSidebar(isSidebarActive)
  }, [isSidebarActive])

  function changeLanguage(langCode) {
    setCurrentLanguage(languages[langCode])
    i18n.changeLanguage(langCode)
    setLocalStorage(langCode)
    window.location.reload()
  }

  return (
    <header dir='rtl'>
      <div
        className={isSidebarActive ? 'blur-container active' : "blur-container"}
        onClick={() => setIsSidebarActive(false)}
      ></div>

      <div className='header-content'>
        <div className='container'>
          <div className='logo'>
            <img
              alt='Royal Hotel Logo'
              loading='lazy'
              src={require('../assets/images/logo.webp')}
            />
          </div>

          <div className='sidebar-btn-container language-relative-container'>
            <div className={isSidebarActive ? 'sidebar-btn active' : 'sidebar-btn'}>
              <div>{currentLanguage}</div>

              <div className='language-dropdown'>
                <ul>
                  <li onClick={() => changeLanguage('ar')}>العربية</li>
                  <li onClick={() => changeLanguage('en')}>English</li>
                  <li onClick={() => changeLanguage('fa')}>فارسى</li>
                  <li onClick={() => changeLanguage('ur')}>اردو</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
