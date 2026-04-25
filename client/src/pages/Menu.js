import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import 'swiper/css'
import { Swiper, SwiperSlide } from 'swiper/react'
import '../styles/Menu.css'
import gsap from 'gsap'
import Card from '../components/Card'
import CardModel from '../components/CardModel'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import URL from '../URL'
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs'

function Menu() {
    const [typeIndex, setTypeIndex] = useState(0)
    const [type, setType] = useState('')
    const [hoverWidth, setHoverWidth] = useState(0)
    const [categories, setCategories] = useState([])
    const slide = useRef(null)
    const { i18n, t } = useTranslation()
    const hover = useRef(null)
    const model = useRef(null)
    const scrollYRef = useRef(0)
    const [blurActive, setBlurActive] = useState(false)
    const [currentData, setCurrentData] = useState({ names: [], description: [] })
    const [data, setData] = useState([])
    const [dishesLoading, setDishesLoading] = useState(true)
    const [opacity, setOpacity] = useState(1)
    const swiperRef = useRef(null)
    const currentLang = i18n.language

    useEffect(() => {
        setHoverWidth(slide.current?.clientWidth)
        gsap.to(hover.current, {
            x: -100 * typeIndex + "%",
            duration: .8 + Math.pow(10, -1) * typeIndex,
            ease: "expo.inOut"
        })
    }, [typeIndex])

    function open() {
        setBlurActive(true)

        scrollYRef.current = window.scrollY

        document.body.style.position = 'fixed'
        document.body.style.top = `-${scrollYRef.current}px`
        document.body.style.left = '0'
        document.body.style.right = '0'
        document.body.style.width = '100%'
        document.body.style.overflow = 'hidden'

        document.documentElement.style.overflow = 'hidden'

        gsap.to(model.current, {
            y: 0,
            duration: 1.5,
            ease: "expo.inOut",
            overwrite: true
        })
    }

    function close() {
        setBlurActive(false)

        const scrollY = scrollYRef.current

        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.width = ''
        document.body.style.overflow = ''

        document.documentElement.style.overflow = ''

        window.scrollTo(0, scrollY)

        gsap.to(model.current, {
            y: '100dvh',
            duration: .5,
            ease: "expo.in",
            overwrite: true
        })
    }

    function switchType(newType) {
        setType(newType)
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get(`${URL}/category/`, {
                    withCredentials: true
                })

                const sortedData = res.data.data.sort((a, b) => a.order - b.order)
                setCategories(sortedData)
            } catch (err) {
                console.log(err)
            }
        }

        fetchData()
    }, [])

    const loadDishes = useCallback(async () => {
        try {
            const url = type ? `${URL}/menu?type=${type}` : `${URL}/menu`
            const res = await axios.get(url, { withCredentials: true })

            const sortedData = res.data.data.sort((a, b) => a.order - b.order)

            setData(sortedData)
            setOpacity(1)

            if (sortedData.length > 0) {
                setCurrentData(sortedData[0])
            }
        } catch (err) {
            console.error("Error fetching data:", err)
        } finally {
            setDishesLoading(false)
        }
    }, [type])

    useEffect(() => {
        if (dishesLoading) {
            loadDishes()
        }
    }, [dishesLoading, loadDishes])

    const groupedDishes = useMemo(() => {
        const grouped = {}

        for (const item of data) {
            if (!grouped[item.category]) {
                grouped[item.category] = []
            }
            grouped[item.category].push(item)
        }

        return grouped
    }, [data])

    return (
        <main id='menu'>
            <img
                className='pattern-img'
                alt="pattern"
                loading='lazy'
                src={require("../assets/images/pattern.webp")}
            />

            <div
                className={blurActive ? 'blur-layer active' : "blur-layer"}
                onClick={() => { close() }}
            ></div>

            <CardModel
                modelRef={model}
                data={currentData}
                doClose={() => { close() }}
            />

            <section className='filters' dir='rtl'>
                <Swiper
                    ref={swiperRef}
                    slidesPerView={7}
                    centeredSlides={!true}
                    spaceBetween={1}
                    breakpoints={{
                        0: {
                            slidesPerView: 2.7
                        },
                        600: {
                            slidesPerView: 4.5
                        },
                        992: {
                            slidesPerView: 5.5
                        },
                        1200: {
                            slidesPerView: 7
                        }
                    }}
                >
                    <SwiperSlide className='hover' style={{ width: hoverWidth }} ref={hover}></SwiperSlide>

                    <SwiperSlide
                        className={0 === typeIndex ? 'button active' : "button"}
                        onClick={() => {
                            setTypeIndex(0)
                            setOpacity(0)
                            switchType('')
                            setDishesLoading(true)
                        }}
                    >
                        {t("ALL")}
                    </SwiperSlide>

                    {
                        categories.length > 0 ? categories.map((d, i) => {
                            return (
                                <SwiperSlide
                                    key={d._key}
                                    ref={i === 0 ? slide : null}
                                    className={i + 1 === typeIndex ? 'button active' : "button"}
                                    onClick={() => {
                                        setTypeIndex(i + 1)
                                        setOpacity(0)
                                        switchType(d._key)
                                        setDishesLoading(true)
                                    }}
                                >
                                    {d.names.find(n => n.language === currentLang).value}
                                </SwiperSlide>
                            )
                        }) : null
                    }
                </Swiper>

                <div className='navigation'>
                    <div className='arrow-container' onClick={() => {
                        swiperRef.current.swiper.slideNext()
                    }}>
                        <BsChevronLeft />
                    </div>

                    <div className='arrow-container' onClick={() => {
                        swiperRef.current.swiper.slidePrev()
                    }}>
                        <BsChevronRight />
                    </div>
                </div>
            </section>

            <section className='dishes-section'>
                {
                    type ? (
                        <div className="container" style={{ opacity, transition: ".5s ease" }}>
                            {data.map((d) => (
                                <Card
                                    key={d._key}
                                    data={d}
                                    openModel={() => {
                                        setCurrentData(d)
                                        open()
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <>
                            {categories.map((category) => (
                                <section key={category._key} className='category-section'>
                                    <h1 className="brand-title">
                                        {category.names.find(n => n.language === currentLang)?.value}
                                    </h1>

                                    <div className='container'>
                                        {(groupedDishes[category._key] || []).map((d) => (
                                            <Card
                                                key={d._key}
                                                data={d}
                                                openModel={() => {
                                                    setCurrentData(d)
                                                    open()
                                                }}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </>
                    )
                }
            </section>
        </main>
    )
}

export default Menu
