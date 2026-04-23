import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './layout/Dashboard';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translations from './langs';
import AddUser from './pages/AddUser';
import Loading from './components/Loading';
import EditDish from './pages/EditDish';
import ManageCategories from './pages/ManageCategories';
import Home from './pages/Home';
import LanuageAlert from './components/LanuageAlert';

const Menu = lazy(() => import('./pages/Menu'));
const Login = lazy(() => import('./pages/Login'));
const AddDish = lazy(() => import('./pages/AddDish'));
const AllDishes = lazy(() => import('./pages/AllDishes'));
const AllUsers = lazy(() => import('./pages/AllUsers'));

i18n
  .use(initReactI18next)
  .init({
    resources: translations,
    lng: localStorage.getItem("language") || "ar",
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false
    }
  });

function App() {
  const [initLang, setInitLang] = useState(localStorage.getItem("language") || "ar");
  const [hasChosenLanguage, setHasChosenLanguage] = useState(!!localStorage.getItem("language"));

  useEffect(() => {
    const language = localStorage.getItem("language");

    if (language) {
      setInitLang(language);
      i18n.changeLanguage(language);
    } else {
      setInitLang("ar");
      i18n.changeLanguage("ar");
      setHasChosenLanguage(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = initLang;

    if (initLang === 'ar' || initLang === 'fa' || initLang === 'ur') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [initLang]);

  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <div className={`App ${initLang}`}>
          <div className={!hasChosenLanguage ? 'shadow active' : 'shadow'}></div>
          <LanuageAlert isActive={!hasChosenLanguage} />

          <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/cafe/menu' element={<Menu />} />
            <Route path='/login' element={<Login />} />
            <Route path='/dashboard/add-dish' element={<Dashboard><AddDish /></Dashboard>} />
            <Route path='/dashboard/all-dishes' element={<Dashboard><AllDishes /></Dashboard>} />
            <Route path='/dashboard/manage-categories' element={<Dashboard><ManageCategories /></Dashboard>} />
            <Route path='/dashboard/all-dishes/:id/edit' element={<Dashboard><EditDish /></Dashboard>} />
            <Route path='/dashboard/add-user' element={<Dashboard><AddUser /></Dashboard>} />
            <Route path='/dashboard/all-users' element={<Dashboard><AllUsers /></Dashboard>} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </Suspense>
  );
}

export default App;
