import React from 'react'
import { useTranslation } from 'react-i18next'

function NoResult() {
    const {t} = useTranslation()
  return (
    <div style={{fontSize:"var(--title)", width:"100%", textAlign:"center",margin:'auto', minHeight:"60dvh", display:"flex", "alignItems":"center", justifyContent:'center'}}>
        {t("Sorry, no results were found.")}
    </div>
  )
}

export default NoResult