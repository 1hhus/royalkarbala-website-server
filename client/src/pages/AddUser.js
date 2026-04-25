import React, { useState } from 'react'
import '../styles/Form.css'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import URL from '../URL'
import { BsCheck } from 'react-icons/bs'
function AddUser() {
    const {t} = useTranslation()
    const [data, setData] = useState({
        name:"",
        password:"",
        confirm:"",
        permissions: []
    })
    const [error,setError] = useState("")
    const togglePermission = (permission) => {
        setData((prevData) => {
          const permissions = prevData.permissions.includes(permission)
            ? prevData.permissions.filter((p) => p !== permission) // Remove permission
            : [...prevData.permissions, permission]; // Add permission
          return { ...prevData, permissions };
        });
      };
    async function create(){
        if(data.password === data.confirm){
            await axios.post(`${URL}/auth/create`, data, {withCredentials:true})
            .then(res => {
                setError(res.data.message)
                if(res.status === 201 || res.status === 200){
                    window.location.reload()
                }
            })
            .catch(err => {
                setError(err.response.data.message)
                console.log(err)
            })
        }else {
            setError("كلمات المرور غير متتطابقة")
        }
    }
  return (
    <div className='form-page'>
        <div>
            <h1>{t("Add New User")}</h1>
        </div>
        <form style={{marginTop:'1rem'}}>
            <div className='row'>
                <div className='field'>
                    <label>{t("username")}</label>
                    <input type='text' value={data.name} onChange={e => setData(d => {return {...d, name:e.target.value}})} />
                </div>
                <div className='field'>
                    <label>{t("password")}</label>
                    <input type='password' value={data.password} onChange={e => setData(d => {return {...d, password:e.target.value}})} />
                </div>
                <div className='field'>
                    <label>{t("confirm password")}</label>
                    <input type='password' value={data.confirm} onChange={e => setData(d => {return {...d, confirm:e.target.value}})} />
                </div>
                <div>
                    <div className='checkbox-container' onClick={() => togglePermission("MENU")}>
                        <div className='checkbox'>
                            {
                                data.permissions.includes("MENU") ? <BsCheck /> : null
                            }
                        </div>
                        <label for='permissions'>{t("menu")}</label>
                    </div>
                    <div className='checkbox-container'  onClick={() => togglePermission("USERS")}>
                        <div className='checkbox'>
                            {
                                data.permissions.includes("USERS") ? <BsCheck /> : null
                            }
                        </div>
                        <label for='permissions'>{t("Users")}</label>
                    </div>
                </div>
                <div>
                    <button onClick={(e) => {
                        e.preventDefault();
                        create()
                    }}>{t("Add New User")}</button>
                </div>
            </div>
        </form>
        <div className='errors-container'>
            <p>{error}</p>
        </div>
    </div>
  )
}

export default AddUser