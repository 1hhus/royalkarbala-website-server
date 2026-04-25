import React, {useEffect, useState} from 'react'
import '../styles/Form.css'
import '../styles/Login.css'
import axios from 'axios'
import URL from '../URL'
import { useTranslation } from 'react-i18next'
function Login() {
    const [data, setData] = useState({
        name:"",
        password:""
    })
    const {t} = useTranslation()
    const [error,setError] = useState("")
    
    async function loginSubmit(){
        await axios.post(`${URL}/auth/login`, data, {withCredentials:true})
                    .then(res => {
                        if(res.status === 200 || res.status === 201){
                            window.location = '/dashboard/add-dish'
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        setError(err.response.data.message)
                    })
    }

    async function checkAuth(){
        await axios.get(`${URL}/auth/check-auth`, {withCredentials:true})
                    .then(res => {
                        if(res.status === 200){
                            window.location = '/dashboard/add-dish'
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    })
    }
    useEffect(() => {
        checkAuth()
    }, [])
  return (
    <main className='login form-page'>
        <img src={require('../assets/images/pattern.webp')} className='pattern' alt='pattern' loading='lazy' />
        <div className='container'>
            <div className='title'>
                <h1>{t("login")}</h1>
            </div>
            <div className='form-container'>
                <form>
                    <div className='row'>
                        <label>{t("username")}</label>
                        <input name='username' required type='text' value={data.name} onChange={e => {setData({...data,name:e.target.value})}} id='name'  />
                    </div>
                    <div className='row'>
                        <label>{t("password")}</label>
                        <input name='password' required type='password' value={data.password} onChange={e => {setData({...data,password:e.target.value})}}  id='password'  />
                    </div>
                    <div className='row'>
                        <button onClick={e => {
                            e.preventDefault()
                            loginSubmit()
                        }}>
                            <div className='btn-wrapper'>
                                <div>{t("login")}</div>
                                <div>{t("login")}</div>
                            </div>
                        </button>
                    </div>
                </form>
            </div>
            <div className='errors-container'>
                <p>{error}</p>
            </div>
        </div>
    </main>
  )
}

export default Login