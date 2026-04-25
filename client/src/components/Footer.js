import React from 'react'
  // import {Link} from 'react-router-dom'
import "../styles/Footer.css"
import { BsStarFill } from 'react-icons/bs'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useTranslation } from 'react-i18next'
gsap.registerPlugin(ScrollTrigger)
function Footer() {
  const {t} = useTranslation()
  // const footerImage = useRef(null)
  // const footerRef = useRef(null)
  // const footerBTN = useRef(null)
  // useEffect(()=> {
  //   gsap.to(footerImage.current, {
  //     y:"2rem",
  //     scrollTrigger:{
  //       trigger:footerRef.current,
  //       start: "top 50%",
  //       end: "bottom bottom",
  //       scrub:1
  //     }
  //   })
  //   gsap.to(footerBTN.current, {
  //     y:"2rem",
  //     scrollTrigger:{
  //       trigger:footerRef.current,
  //       start: "top 40%",
  //       end: "bottom bottom",
  //       scrub:1
  //     }
  //   })
  // })
  return (
    <footer>
      <div className='container'>
        {/* <div className='col'>
          <h2>القائمة</h2>
          <ul>
            <li>
              <Link to='/'>حول الفندق</Link>
            </li>
            <li>
              <Link to='/menu'>المنيو الألكتروني</Link>
            </li>
            <li>
              <Link to='/book'>حجز</Link>
            </li>
          </ul>
        </div> */}
        <div className='col'>
          <h2>{t("contact")}</h2>
          <ul>
            <li>
              <a href='https://www.instagram.com/royal_karbala/'> 
                {t("instagram")}
              </a>
            </li>
            <li>
              <a href='https://www.facebook.com/p/%D9%81%D9%86%D8%AF%D9%82-%D8%B1%D9%88%D9%8A%D8%A7%D9%84-%D9%83%D8%B1%D8%A8%D9%84%D8%A7%D8%A1-Royal-Karbala-Hotel-100069569226686/'> 
                {t("facebook")}
              </a>
            </li>
            <li>
              <a href='tel:07753000300'> 
                {t("call")}
              </a>
            </li>
          </ul>
        </div>
        <div className='logo-container'>
          <div className='logo'>
            <img src={require('../assets/images/logo.webp')} alt='logo' loading='lazy' />
          </div>
          <div className='stars'>
            {
              [...Array(5)].map((_,i) => {
                return <BsStarFill key={i} />
              })
            }
          </div>
        </div>
      </div>
      <div className='container' style={{display:'flex', justifyContent:"center"}}>
        <a href='https://hussainrafid.com' style={{fontSize:"calc(var(--paragraph) * .8)", textAlign:"center", color:"var(--primary)", textDecoration:"none"}}>Code By Hussain</a>
      </div>
      {/* <div className='image-container'>
        <button ref={footerBTN}>
          <div className='icon'>
            <BsFlower1 />
          </div>
          <div className='wrapper'>
            <div>
              أحجز الان
            </div>
            <div>
              أحجز الان
            </div>
          </div>
          <div className='icon'>
            <BsFlower1 />
          </div>
        </button>
        <img alt="footer" loading='lazy' src={require("../assets/images/menu.webp")} ref={footerImage} />
      </div> */}
    </footer>
  )
}

export default Footer
