import React from 'react'
import Banner from '../../components/Home/Banner'
import Places from '../../components/Home/Places'
import AllNews from '../../components/Home/AllNews'
import Timeline from '../../components/Home/Timeline'
const Home = () => {
  return (
    <div>
      <Banner />
      <Places />
      <AllNews />
      <Timeline />
    </div>
  )
}

export default Home