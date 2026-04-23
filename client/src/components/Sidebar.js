import React from 'react'
import '../styles/Sidebar.css'
import {Link} from 'react-router-dom'
import {BsArrowLeftCircle, BsBoxArrowRight, BsPerson, BsPersonAdd, BsPlusCircleDotted, BsTag} from 'react-icons/bs'
import { useTranslation } from 'react-i18next'
import URL from '../URL'
import axios from 'axios'
function Sidebar() {
  const  {t} = useTranslation()

  async function logout() {
    await axios.post(`${URL}/auth/logout`, {}, {withCredentials:true})
              .then(res => {
                if(res.status === 200){
                  window.location = '/login'
                }
              })
              .catch(err => {
                alert("حدث خطا")
                console.log(err)
              })
  }
  return (
    <aside className='sidebar'>
      <div className='container'>
        <h2>{t('menu')}</h2>
      <div className='buttons-container'>
        <div className='sidebar-section'>
          <h3>{t('menu')}</h3>
            <ul>
              <li>
                <Link to='/dashboard/add-dish'>
                  <div className='link-content'>
                    <div className='icon'>                   
                      <BsPlusCircleDotted />
                    </div>
                    <div>
                      {t("Add Dish")}
                    </div>
                  </div>
                </Link>
              </li>
              <li>
                <Link to='/dashboard/all-dishes'>
                  <div className='link-content'>
                    <div className='icon'>                   
                      <BsArrowLeftCircle />
                    </div>
                    <div>
                    {t("All Dishes")}
                    </div>
                  </div>
                </Link>
              </li>
              <li>
                <Link to='/dashboard/manage-categories'>
                  <div className='link-content'>
                    <div className='icon'>                   
                      <BsTag />
                    </div>
                    <div>
                    {t("Manage Categories")}
                    </div>
                  </div>
                </Link>
              </li>
          </ul>
        </div>
        <div className='sidebar-section'>
          <h3>المستخدمين</h3>
            <ul>
              <li>
                <Link to='/dashboard/add-user'>
                  <div className='link-content'>
                    <div className='icon'>                   
                      <BsPersonAdd />
                    </div>
                    <div>
                      {t("Add New User")}
                    </div>
                  </div>
                </Link>
              </li>
              <li>
                <Link to='/dashboard/all-users'>
                  <div className='link-content'>
                    <div className='icon'>                   
                      <BsPerson />
                    </div>
                    <div>
                      {t("All Users")}
                    </div>
                  </div>
                </Link>
              </li>
          </ul>
        </div>
        <div className='sidebar-sectison'>
            <ul>
              <li onClick={() => {
                logout()
              }}>
                <a href='#none'>
                  <div className='link-content'>
                    <div className='icon'>                   
                      <BsBoxArrowRight />
                    </div>
                    <div>
                      {t("Log Out")}
                    </div>
                  </div>
                </a>
              </li>
          </ul>
        </div>
      </div>
      </div>
    </aside>
  )
}

export default Sidebar