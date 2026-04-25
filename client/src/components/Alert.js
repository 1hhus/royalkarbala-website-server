import React from 'react'
import '../styles/Alert.css'
import { useTranslation } from 'react-i18next'
function Alert(props) {
    const {t} = useTranslation()
  return (
    <div className={props.isActive ? 'alert-container active' : 'alert-container'}>
        <div className='container'>
            <h2>{t("warning")}</h2>
            <p>{t("delete_warning_message")}</p>
            <div className='btns-container'>
                <button className='dont' onClick={e => {
                    e.preventDefault()
                    props.cancel()
                }}>{t("no_cancel")}</button>
                <button className='do' onClick={e => {
                    e.preventDefault()
                    props.delete()
                }}>{t("yes_delete")}</button>
            </div>
        </div>
    </div>
  )
}

export default Alert