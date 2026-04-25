import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './layout/Dashboard'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import translations from './langs'
import AddUser from './pages/AddUser'
import Loading from './components/Loading'
import EditDish from './pages/EditDish'
import ManageCategories from './pages/ManageCategories'
import Home from './pages/Home'
import LanuageAlert from './components/LanuageAlert'
import DefaultDishImage from './pages/DefaultDishImage'

const Menu = lazy(() => import('./pages/Menu'))
const Login = lazy(() => import('./pages/Login'))
const AddDish = lazy(() => import('./pages/AddDish'))
const AllDishes = lazy(() => import('./pages/AllDishes'))
const AllUsers = lazy(() => import('./pages/AllUsers'))

function App() {
  const [initLang, setInitLang] = useState('ar')
  const [hasChosenLanguage, setHasChosenLanguage] = useState(true)

  i18n
    .use(initReactI18next)
    .init({
      resources: translations,
      lng: initLang,
      fallbackLng: initLang,
      interpolation: {
        escapeValue: false
      }
    })

  useEffect(() => {
    const language = localStorage.getItem('language')

    if (language) {
      setInitLang(language)
    } else {
      setInitLang('ar')
      setHasChosenLanguage(false)
    }
  }, [])

  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <div className={`App ${initLang}`}>
          <div className={!hasChosenLanguage ? 'shadow active' : 'shadow'}></div>

          <LanuageAlert isActive={!hasChosenLanguage ? true : false} />

          <Navbar />

          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/cafe/menu' element={<Menu />} />
            <Route path='/login' element={<Login />} />

            <Route path='/dashboard/add-dish' element={<Dashboard><AddDish /></Dashboard>} />
            <Route path='/dashboard/all-dishes' element={<Dashboard><AllDishes /></Dashboard>} />
            <Route path='/dashboard/manage-categories' element={<Dashboard><ManageCategories /></Dashboard>} />
            <Route path='/dashboard/default-dish-image' element={<Dashboard><DefaultDishImage /></Dashboard>} />
            <Route path='/dashboard/all-dishes/:id/edit' element={<Dashboard><EditDish /></Dashboard>} />

            <Route path='/dashboard/add-user' element={<Dashboard><AddUser /></Dashboard>} />
            <Route path='/dashboard/all-users' element={<Dashboard><AllUsers /></Dashboard>} />
          </Routes>

          <Footer />
        </div>
      </Router>
    </Suspense>
  )
}

export default App
