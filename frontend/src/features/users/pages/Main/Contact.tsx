import React from 'react'
import Banner from '../../components/Contact/Banner'
import MailPosition from '../../components/Contact/MailPosition'
import Feedback from '../../components/Contact/Feedback'
import Faq from '../../components/Contact/Faq/FaqList'

const Contact = () => {
  return (
    <div>
      <Banner />
      <MailPosition />
      <Feedback />
      <Faq />
    </div>
  )
}

export default Contact