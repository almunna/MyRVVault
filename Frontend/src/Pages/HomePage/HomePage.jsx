import React from 'react'
import Hero from '../../components/home/Hero'
import WelcomeEdiie from '../../components/home/WelcomeEdiie'
import Faq from '../../components/home/Faq'
import Review from '../../components/home/Review'

export const HomePage = () => {
  return (
    <div>
      <Hero></Hero>
      <WelcomeEdiie></WelcomeEdiie>
      <Review></Review>
      <Faq></Faq>
    </div>
  )
}
