import React, { useEffect, useRef, useState } from 'react'
import '../styles/Form.css'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import URL from '../URL'
import '../styles/AllDishes.css'
import Alert from '../components/Alert'
import Loading from '../components/Loading'
import { BsChevronLeft, BsChevronRight, BsEyeSlash, BsPen } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import NoAuth from '../components/NoAuth'
import NoResult from '../components/NoResult'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { SwiperSlide, Swiper } from 'swiper/react'
import 'swiper/css'

function AllDishes() {
  const { t, i18n } = useTranslation()
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [selectedData, setSelectedData] = useState({})
  const [isAlertActive, setIsAlertActive] = useState(false)
  const currentLanguage = i18n.language
  const swiperRef = useRef(null)
  const slide = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notAuth, setNotAuth] = useState(false)
  const [typeIndex, setTypeIndex] = useState(0)
  const [type, setType] = useState(null)

  async function loadData() {
    await axios.get(`${URL}/menu/all?type=${type}`, { withCredentials: true })
      .then(res => {
        const sortedData = res.data.data.sort((a, b) => a.order - b.order)
        setData(sortedData)
      })
      .catch(err => {
        console.log(err)
        if (err.response?.status === 403) {
          setNotAuth(true)
        }
      })

    await axios.get(`${URL}/category/all`, { withCredentials: true })
      .then(res => {
        const sortedData = res.data.data.sort((a, b) => a.order - b.order)
        setCategories(sortedData)
      })
      .catch(err => {
        console.log(err)
        if (err.response?.status === 403) {
          setNotAuth(true)
        }
      })

    setIsLoading(false)
  }

  async function deleteData() {
    await axios.delete(`${URL}/menu/${selectedData._key}/delete`, { withCredentials: true })
      .then(res => {
        if (res.status === 200) {
          window.location.reload()
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  async function toggle(id) {
    await axios.put(`${URL}/menu/${id}/toggle-hide`, {}, { withCredentials: true })
      .then(res => {
        if (res.status === 200) {
          window.location.reload()
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  useEffect(() => {
    if (isLoading) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, type])

  const handleOnDragEnd = async (result) => {
    const { destination, source } = result

    if (!destination) return

    const items = Array.from(data)
    const [reorderedItem] = items.splice(source.index, 1)
    items.splice(destination.index, 0, reorderedItem)

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }))

    setData(updatedItems)

    try {
      await axios.put(
        `${URL}/menu/update-order`,
        { reorderedItems: updatedItems },
        { withCredentials: true }
      )
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  return isLoading ? <Loading /> : notAuth ? <NoAuth /> : (
    <div className='form-page all-dishes'>
      <Alert
        isActive={isAlertActive}
        delete={() => { deleteData() }}
        cancel={() => { setIsAlertActive(false) }}
      />

      <div
        className={isAlertActive ? 'blur-container active' : 'blur-container'}
        onClick={() => { setIsAlertActive(false) }}
      ></div>

      <div>
        <h1 className='brand-title'>{t('All Dishes')}</h1>

        <form>
          <div className='search-container'>
            <label>{t('search')}</label>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              type='text'
              name='search'
            />
          </div>
        </form>

        <section className='filters' dir='rtl'>
          <Swiper
            ref={swiperRef}
            slidesPerView={7}
            centeredSlides={false}
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
            <SwiperSlide
              className={typeIndex === 0 ? 'button active' : 'button'}
              onClick={() => {
                setTypeIndex(0)
                setType(null)
                setIsLoading(true)
              }}
            >
              {t('All Dishes')}
            </SwiperSlide>

            {
              categories.length > 0
                ? categories.map((d, i) => (
                  <SwiperSlide
                    key={i}
                    ref={i === 0 ? slide : null}
                    className={i + 1 === typeIndex ? 'button active' : 'button'}
                    onClick={() => {
                      setTypeIndex(i + 1)
                      setType(d._key)
                      setIsLoading(true)
                    }}
                  >
                    {d.names.find(n => n.language === currentLanguage)?.value}
                  </SwiperSlide>
                ))
                : null
            }
          </Swiper>

          <div className='navigation'>
            <div
              className='arrow-container'
              onClick={() => {
                swiperRef.current.swiper.slideNext()
              }}
            >
              <BsChevronLeft />
            </div>

            <div
              className='arrow-container'
              onClick={() => {
                swiperRef.current.swiper.slidePrev()
              }}
            >
              <BsChevronRight />
            </div>
          </div>
        </section>
      </div>

      {
        data.filter(d => {
          return search !== ''
            ? d.names.find(n => n.language === currentLanguage)?.value.includes(search)
            : d
        }).length > 0
          ? (
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="dishes" direction="vertical">
                {(provided) => (
                  <div
                    className="dishes-container"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(1, 1fr)',
                      gap: '20px'
                    }}
                  >
                    {
                      data.filter(d => {
                        return search !== ''
                          ? d.names.find(n => n.language === currentLanguage)?.value.includes(search)
                          : d
                      }).map((dish, index) => (
                        <Draggable key={dish._key} draggableId={dish._key} index={index}>
                          {(provided) => (
                            <div
                              className='dish'
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                cursor: 'grab'
                              }}
                            >
                              <div className='img'>
                                <img
                                  src={`${URL.replace(/\/api$/, '')}/imgs/${dish.image}`}
                                  loading='lazy'
                                  alt={dish.names[0]?.value || ''}
                                />

                                {
                                  dish.isHidden && (
                                    <div className='hidden-state-container'>
                                      <div className='hidden-icon'>
                                        <BsEyeSlash />
                                      </div>
                                    </div>
                                  )
                                }
                              </div>

                              <div className='dish-body'>
                                <div className='main-info'>
                                  <h1>{dish.names.find(d => d.language === currentLanguage)?.value || ''}</h1>
                                  <p>{dish.price} <span>{t('IQD')}</span></p>
                                </div>

                                <div>
                                  <p className='paragraph'>
                                    {dish.description.find(d => d.language === currentLanguage)?.value || ''}
                                  </p>
                                </div>

                                <div className='btns-container'>
                                  <button onClick={e => {
                                    e.preventDefault()
                                    setSelectedData(dish)
                                    setIsAlertActive(true)
                                  }}>
                                    {t('delete dish')}
                                  </button>

                                  <button
                                    className='hide-dish'
                                    onClick={e => {
                                      e.preventDefault()
                                      toggle(dish._key)
                                    }}
                                  >
                                    {dish.isHidden ? t('show dish') : t('hide dish')}
                                  </button>
                                </div>

                                <div className='edit-btn-container'>
                                  <Link to={`/dashboard/all-dishes/${dish._key}/edit`}>
                                    <button>
                                      <div>{t('edit')}</div>
                                      <div><BsPen /></div>
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    }

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )
          : <NoResult />
      }
    </div>
  )
}

export default AllDishes
