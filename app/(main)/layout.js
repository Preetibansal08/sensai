import React from 'react'

const MainLayout = ({children}) => {

    //redirect to onboarding
  return (
    <div className='container mx-auto mt-24 mb-20'>{children}</div>
  )
}

export default MainLayout