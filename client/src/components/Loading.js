import React from 'react'
import '../styles/Loading.css'
import {BarLoader } from 'react-spinners'
import { useTranslation } from 'react-i18next'
function Loading() {
    const {t} = useTranslation()
  return (
    <div className='loading'>
        <div className='loader-container'>
            <h4>{t('loading')}</h4>
            <BarLoader color='#5B2B02'  />
        </div>
    </div>
  )
}

export default Loading