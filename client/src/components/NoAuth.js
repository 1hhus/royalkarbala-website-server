import React from 'react'
import { useTranslation } from 'react-i18next'
import '../styles/noAuth.css'
function NoAuth() {
    const {t} = useTranslation()
  return (
    <div className='no-auth'>
        <h1>{t("This User is Unauthorized")}</h1>
    </div>
  )
}

export default NoAuth