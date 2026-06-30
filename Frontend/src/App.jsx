import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import CompareTray from './components/CompareTray';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import PropertiesPage from './pages/PropertiesPage';
import LandsPage from './pages/LandsPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import ListPropertyPage from './pages/ListPropertyPage';
import DashboardPage from './pages/DashboardPage';

// Layout component to wrap pages that share the Header/Footer
const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 w-full overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-800 flex flex-col">
      <Header />
      <main className="w-full flex-grow">
        <Outlet />
      </main>
      <Footer />
      <AIChatbot />
      <CompareTray />
      <ScrollRestoration />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <AuthPage type="login" />,
      },
      {
        path: "/register",
        element: <AuthPage type="register" />,
      },
      {
        path: "/buy",
        element: <PropertiesPage initialFilters={{ type: 'sale' }} title="Properties for Sale" />,
      },
      {
        path: "/rent",
        element: <PropertiesPage initialFilters={{ type: 'rent' }} title="Properties for Rent" />,
      },
      {
        path: "/lands",
        element: <LandsPage />,
      },
      {
        path: "/search",
        element: <PropertiesPage title="Search Results" />,
      },
      {
        path: "/property/:id",
        element: <PropertyDetailsPage />,
      },
      {
        path: "/list-property",
        element: <ListPropertyPage />,
      },
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/wishlist",
        element: <DashboardPage />, // Dashboard handles wishlist tab
      },
    ],
  },
]);

function RealEstateApp() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default RealEstateApp;