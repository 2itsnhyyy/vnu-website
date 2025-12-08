import { useState } from 'react'
import { useRoutes } from 'react-router-dom'
import routes from './features/users/routers'
import { MainProvider } from './features/users/context/MainContext'

function App() {
  const element = useRoutes(routes);
  return (
    <MainProvider>
      {element}
    </MainProvider>
  )
}

export default App
