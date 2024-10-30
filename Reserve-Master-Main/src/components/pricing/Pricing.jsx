import React from "react"
import Back from "../common/Back"
import img from "../images/gallery.jpg"
import FeaturedCard from "../home/featured/FeaturedCard";

const Pricing = () => {
  return (
    <>
      <section className='pricing mb'>
        <Back name='Gallery' title='Laberatory Views' cover={img} />
        <div className='featured container'>
          <FeaturedCard />
        </div>
      </section>
    </>
  )
}

export default Pricing
