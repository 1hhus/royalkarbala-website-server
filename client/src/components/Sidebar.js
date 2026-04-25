import React from 'react'
import '../styles/Sidebar.css'
import { Link } from 'react-router-dom'
import {
  BsArrowLeftCircle,
  BsBoxArrowRight,
  BsImage,
  BsPerson,
  BsPersonAdd,
  BsPlusCircleDotted,
  BsTag
} from 'react-icons/bs'
import { useTranslation } from 'react-i18next'
import URL from '../URL'
import axios from 'axios'

function Sidebar() {
  const { t } = useTranslation()

  async function logout() {
    await axios.post(`${URL}/auth/logout`, {}, { withCredentials: true })
      .then(res => {
        if (res.status === 200) {
          window.location = '/login'
        }
      })
      .catch(err => {
        alert('حدث خطأ')
        console.log(err)
      })
  }

  return (
    <aside className='sidebar'>
      <h2>{t('menu')}</h2>

      <div className='sidebar-section'>
        <h3>{t('menu')}</h3>

        <ul>
          <li>
            <Link to='/dashboard/add-dish'>
              <div className='link-content'>
                <div className='icon'>
                  <BsPlusCircleDotted />
                </div>
                <span>{t('Add Dish')}</span>
              </div>
            </Link>
          </li>

          <li>
            <Link to='/dashboard/all-dishes'>
              <div className='link-content'>
                <div className='icon'>
                  <BsArrowLeftCircle />
                </div>
                <span>{t('All Dishes')}</span>
              </div>
            </Link>
          </li>

          <li>
            <Link to='/dashboard/manage-categories'>
              <div className='link-content'>
                <div className='icon'>
                  <BsTag />
                </div>
                <span>{t('Manage Categories')}</span>
              </div>
            </Link>
          </li>

          <li>
            <Link to='/dashboard/default-dish-image'>
              <div className='link-content'>
                <div className='icon'>
                  <BsImage />
                </div>
                <span>الصورة التلقائية</span>
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
                <span>{t('Add New User')}</span>
              </div>
            </Link>
          </li>

          <li>
            <Link to='/dashboard/all-users'>
              <div className='link-content'>
                <div className='icon'>
                  <BsPerson />
                </div>
                <span>{t('All Users')}</span>
              </div>
            </Link>
          </li>

          <li>
            <button className='sidebar-logout-btn' onClick={logout}>
              <div className='link-content'>
                <div className='icon'>
                  <BsBoxArrowRight />
                </div>
                <span>{t('Log Out')}</span>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar
