import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../styles/AllUsers.css'
import axios from 'axios'
import URL from '../URL'
import formatDate from '../components/formatDate'
import Alert from '../components/Alert'
import NoAuth from '../components/NoAuth'

function AllUsers() {
    const { t } = useTranslation()

    const [search, setSearch] = useState('')
    const [isAlertActive, setIsAlertActive] = useState(false)
    const [selectedData, setSelectedData] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState([])
    const [msg, setMsg] = useState('')
    const [notAuth, setNotAuth] = useState(false)

    async function loadData() {
        try {
            const res = await axios.get(`${URL}/auth/get`, {
                withCredentials: true
            })

            setData(res.data.data)
            setNotAuth(false)
        } catch (err) {
            if (err.response?.status === 403) {
                setNotAuth(true)
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isLoading) {
            loadData()
        }
    }, [isLoading])

    async function deleteData() {
        try {
            const res = await axios.delete(
                `${URL}/auth/${selectedData}/delete`,
                { withCredentials: true }
            )

            setMsg(res.data.message)

            if (res.status === 200) {
                alert("تم حذف المستخدم بنجاح")
                window.location.reload()
            }
        } catch (err) {
            console.log(err)
            setMsg(err.response?.data?.err || '')
        }
    }

    if (isLoading) {
        return null
    }

    if (notAuth) {
        return <NoAuth />
    }

    return (
        <div className='all-users-page'>
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
                <h1 className='brand-title'>{t("All Users")}</h1>

                <form>
                    <div className='search-container'>
                        <label>{t("search")}</label>

                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            type='text'
                            name='search'
                        />
                    </div>
                </form>
            </div>

            <div className='all-users-list-container'>
                <ul>
                    {
                        data
                            .filter(d => search === '' ? true : d.name.includes(search))
                            .map((d) => (
                                <li key={d._key}>
                                    <div className='user-name'>
                                        <h4>{d.name}</h4>
                                    </div>

                                    <div className='join-date'>
                                        <h4>
                                            {t("Join Date")} {formatDate(new Date(d.createdAt))}
                                        </h4>
                                    </div>

                                    <div className='delete-btn'>
                                        <button
                                            onClick={e => {
                                                e.preventDefault()
                                                setIsAlertActive(true)
                                                setSelectedData(d._key)
                                            }}
                                        >
                                            {t("delete")}
                                        </button>
                                    </div>
                                </li>
                            ))
                    }
                </ul>
            </div>

            <p className='message'>{msg}</p>
        </div>
    )
}

export default AllUsers
