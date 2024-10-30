import React from "react"
import Header from "../common/header/Header"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import Home from "../home/Home"
import Footer from "../common/footer/Footer"
import About from "../about/About"
import Pricing from "../pricing/Pricing"
import Services from "../services/Services"
import login from "../login/login"
import Register from "../regsiter/Register"
import Booking from "../booking/Booking"
import All from "../all/All"

const Pages = () => {
  return (
    <>
      <Router>
        <Header />
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/about' component={About} />
          <Route exact path='/today' component={Services} />
          <Route exact path='/booking' component={Booking} />
          <Route exact path='/gallery' component={Pricing} />
          <Route exact path='/All' component={All} />
          <Route exact path='/login' component={login} />
          <Route exact path='/register' component={Register} />
        </Switch>
        <Footer />
      </Router>
    </>
  )
}

export default Pages
