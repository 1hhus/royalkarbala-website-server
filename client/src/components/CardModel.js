import React from 'react'
import '../styles/CardModel.css'
import {BsX} from 'react-icons/bs'
import URL from '../URL'
import { useTranslation } from 'react-i18next'
function CardModel(props) {
    const {t, i18n} = useTranslation()
    const currentLnag = i18n.language
  return (
    <div className={'card-model'} ref={props.modelRef}>
        <div className='card-model-body'>
            <div className='close-btn' onClick={props.doClose}>
                <BsX />
            </div>
            <div className='dish-name'>
                <h1 className='title'>
                    {props.data.names.find(d => d.language === currentLnag)?.value || ""}
                </h1>
                <h3 className='price'>
                    {props.data.price} {t("IQD")}
                </h3>
            </div>
            <div className='paragraph-container'>
                <p className='paragraph'>
                {props.data.description.find(d => d.language === currentLnag)?.value || ""}
                </p>
            </div>
        </div>
        <div className='image'>
            <img alt={props.data.names[0]?.value || ''} src={`${URL.replace(/\/api$/, '')}/imgs/${props.data.image}`}  loading='lazy' />
        </div>
        <img loading='lazy' src={require('../assets/images/pattern.webp')} alt='pattern' className='pattern' />
    </div>
  )
}

export default CardModel