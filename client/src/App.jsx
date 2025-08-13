import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { AppProvider } from './contexts/AppContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import CategoriesPage from './pages/CategoriesPage'
import NotFound from './pages/NotFound'
import LoadingSpinner from './components/LoadingSpinner'
import Notification from './components/Notification'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Home />
      },
      {
        path: 'products',
        element: <Products />
      },
      {
        path: 'products/:id',
        element: <ProductDetail />
      },
      {
        path: 'cart',
        element: <Cart />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'orders',
        element: <Orders />
      },
      {
        path: 'categories',
        element: <CategoriesPage />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);

function App() {
  return (
    <AppProvider>
      <div className="dark min-h-screen bg-dark-900">
        <LoadingSpinner />
        <Notification />
        <RouterProvider router={router} />
      </div>
    </AppProvider>
  )
}

export default App

