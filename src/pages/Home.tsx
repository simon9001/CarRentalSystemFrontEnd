import React from 'react'
import Navbar from '../Componnents/Navbar'
import Footer from '../Componnents/Footer'
import HomeHero from '../Componnents/home/HomeHero'
// import WhatYouWillGet from '../Componnents/home/WhatYouWillGet'
import CustomerReviews from '../Componnents/home/CustomerReviews'

const Home: React.FC = () => {
    return (
        <div className="page-container">
            <Navbar />
            <HomeHero />
            <CustomerReviews />
            <Footer />
        </div>
    )
}

export default Home