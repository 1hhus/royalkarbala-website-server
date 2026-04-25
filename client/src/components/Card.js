import React, { useEffect, useRef, useState } from 'react'
import '../styles/Card.css'
import gsap from 'gsap'
import URL from '../URL'
import { useTranslation } from 'react-i18next'

function Card(props) {
    const card = useRef(null)
    const button = useRef(null)
    const { t, i18n } = useTranslation()
    const currentLanguage = i18n.language

    const [isButtonActive, setIsButtonActive] = useState(false)
    const [axis, setAxis] = useState([0, -1])

    useEffect(() => {
        if (window.matchMedia('(hover: none)').matches) return

        if (isButtonActive) {
            let fromX = 0, fromY = 0

            if (axis[0] === 1) fromX = "350%"
            if (axis[0] === -1) fromX = "-350%"
            if (axis[1] === 1) fromY = "-400%"
            if (axis[1] === -1) fromY = "400%"

            gsap.fromTo(
                button.current,
                { x: fromX, y: fromY },
                { x: 0, y: 0, duration: 0.6, ease: "expo.inOut" }
            )
        } else {
            if (axis[1] === -1) {
                gsap.to(button.current, {
                    y: '-400%',
                    duration: .6,
                    ease: "expo.inOut"
                })
            }

            if (axis[1] === 1) {
                gsap.to(button.current, {
                    y: '400%',
                    duration: .6,
                    ease: "expo.inOut"
                })
            }

            if (axis[0] === 1) {
                gsap.to(button.current, {
                    x: '350%',
                    duration: .6,
                    ease: "expo.inOut"
                })
            }

            if (axis[0] === -1) {
                gsap.to(button.current, {
                    x: '-350%',
                    duration: .6,
                    ease: "expo.inOut"
                })
            }
        }
    }, [isButtonActive, axis])

    return (
        <figure className={`card-container ${currentLanguage}`}>
            <div
                className='image'
                ref={card}
                onClick={() => {
                    if (window.matchMedia('(hover: none)').matches) {
                        props.openModel()
                    }
                }}
                onMouseEnter={(e) => {
                    if (window.matchMedia('(hover: none)').matches) return

                    const rect = card.current.getBoundingClientRect()
                    const centerX = rect.left + rect.width / 2
                    const centerY = rect.top + rect.height / 2

                    const offsetX = e.clientX - centerX
                    const offsetY = e.clientY - centerY

                    let axisX = 0
                    let axisY = 0

                    if (Math.abs(offsetX) > Math.abs(offsetY)) {
                        axisX = offsetX > 0 ? 1 : -1
                    } else {
                        axisY = offsetY > 0 ? 1 : -1
                    }

                    setAxis([axisX, -axisY])
                    setIsButtonActive(true)
                }}
                onMouseLeave={(e) => {
                    if (window.matchMedia('(hover: none)').matches) return

                    const rect = card.current.getBoundingClientRect()
                    const centerX = rect.left + rect.width / 2
                    const centerY = rect.top + rect.height / 2

                    const offsetX = e.clientX - centerX
                    const offsetY = e.clientY - centerY

                    let axisX = 0
                    let axisY = 0

                    if (Math.abs(offsetX) > Math.abs(offsetY)) {
                        axisX = offsetX > 0 ? 1 : -1
                    } else {
                        axisY = offsetY > 0 ? 1 : -1
                    }

                    setAxis([axisX, axisY])
                    setIsButtonActive(false)
                }}
            >
                <img
                    loading="lazy"
                    decoding="async"
                    alt={props.data.names[0]?.value || ""}
                    src={`${URL.replace(/\/api$/, '')}/imgs/${props.data.image}`}
                />

                <button
                    ref={button}
                    onClick={e => {
                        e.preventDefault()
                        props.openModel()
                    }}
                >
                    {t("MORE")}
                </button>
            </div>

            <figcaption>
                <h2>{props.data.names.find(d => d.language === currentLanguage)?.value || ""}</h2>
                <p>{props.data.price} <span>{t("IQD")}</span></p>
            </figcaption>
        </figure>
    )
}

export default React.memo(Card)
