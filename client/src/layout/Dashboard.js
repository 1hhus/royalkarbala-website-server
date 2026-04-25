import React, {useEffect} from 'react'
import Sidebar from '../components/Sidebar'
import '../styles/DashboardLayout.css'
import '../styles/Form.css'
import axios from 'axios'
import URL from '../URL'
function Dashboard({children}) {
  async function checkAuth(){
    await axios.get(`${URL}/auth/check-auth`, {withCredentials:true})
                .then(res => {
                    if(res.status !== 200){
                        window.location = '/login'
                    }
                  })
                  .catch(err => {
                    if(err.status !== 200){
                        window.location = '/login'
                    }
                })
}
useEffect(() => {
    checkAuth()
}, [])
  return (
    <div className='dashboard-layout'>
        <Sidebar />
        <main style={{paddingTop:"9rem"}} className='container'>
          {children}
        </main>
    </div>
  )
}

export default Dashboard