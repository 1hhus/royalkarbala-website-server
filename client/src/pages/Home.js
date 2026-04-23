import React, { useEffect } from 'react'
import Loading from '../components/Loading'

function Home() {
    useEffect(() => {
        window.location = 'https://royalkarbala.iibooking.com'
    })
  return (
    <div>
        <Loading />
    </div>
  )
}

export default Home