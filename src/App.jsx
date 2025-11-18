import { Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import Loyaout from './Layout/Loyaout'
import Home from './pages/Home/Home'
import Eror from './pages/Eror-404/Eror'
import Login from './pages/Login/Login'
import Profile from './pages/Profile/Profile'
import Company from './pages/Company/Company'
import Users from './pages/Users/Users'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route
          path='/*'
          element={
            <Loyaout>
              <Routes>
                <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path='/company' element={<ProtectedRoute><Company /></ProtectedRoute>} />
                <Route path='/users' element={<ProtectedRoute><Users /></ProtectedRoute>} />
                <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path='*' element={<Eror />} />
              </Routes>
            </Loyaout>
          }
        />
      </Routes>
    </>
  )
}

export default App
