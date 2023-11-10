import {NavLink, Route, Routes, Outlet, useSearchParams} from 'react-router-dom';
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';

import React, {useState} from "react";
import logo from './logo.png';
import logo2 from './logo2.png';
import './App.css';
import _, { capitalize } from 'lodash';
import Home from './components/Home';
import Users from './components/Users';
import Students from './components/Students';
import {cn, tw} from './utils/utils';
import Insurances from './components/Insurances';
import Courses from './components/Courses';
import Login from './components/Login';
import Logout from './components/Logout';
import Invite from './components/Invite';
import Billing from './components/Billing';
import Invoice from './components/Invoice';
import FollowUp from './components/FollowUp';
import Projection from './components/Projection';


const MENU = [
  'usuarios',
  'estudiantes',
  'coberturas',
  'cursos',
  'facturacion',
  'seguimiento',
  'proyeccion',
  'logout',
]

const BRAND = "Crear"


export default function App() {

  const [searchParams] = useSearchParams();

  const user = sessionStorage.username || null;
  const inviteId = searchParams.get("inviteId") || null;

  if (user === null) {
    return (
      <Routes>
        <Route path="/">
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="invite" element={<Invite inviteId={inviteId} />} />
          <Route path="logout" element={<Logout />} />
        </Route>
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/">
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="estudiantes" element={<Students />} />
            <Route path="coberturas" element={<Insurances />} />
            <Route path="cursos" element={<Courses />} />
            <Route path="facturacion" element={<Billing />} />
            <Route path="seguimiento" element={<FollowUp />} />
            <Route path="proyeccion" element={<Projection />} />
            <Route path="home" element={<Home />} />
            <Route path="factura/:invoiceId" element={<Invoice />} />
            <Route path="logout" element={<Logout />} />
          </Route>
          <Route
            path="*"
            element={
              <div className="App">
                <header className="App-header">
                  <img src={logo} className="App-logo" alt="logo" />
                  <p>
                    Edit <code>src/App.js</code> and save to reload.
                  </p>
                  <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn React
                  </a>
                </header>
              </div>
            }
          />
        </Route>
    </Routes>
  );
}


function RootLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function Layout({children}) {

  return (
    <div className="flex flex-col w-full h-screen text-gray-700">
      <nav className="flex justify-between items-center pr-6 w-full h-16 bg-gray-900 text-white">
        <div className="flex gap-2 items-center">
          <h1 className="inline-block text-2xl sm:text-3xl text-white pl-2 tracking-tight dark:text-slate-200">Instituto Crear</h1>
          {/* <img src={logo} className='w-[180px]' alt="logo" /> */}
          {/* <img src={logo2} alt="logo" className="ml-4 w-14 h-14 rounded-full object-cover" /> */}
        </div>
        {
          isMobile ? (
            <MobileMenu />
          ) : (
            <Profile />
          )
        }
        
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        {
          !isMobile && (
            <div className="flex flex-col w-[120px] bg-gray-900 text-white justify-start items-center">
            {
              MENU.map((el, i) => {
                return (
                <NavLink key={i} className="h-16 w-full flex items-center pl-2 hover:text-white hover:bg-gray-400 cursor-pointer" replace to={el}>
                  {capitalize(el)}
                </NavLink>
                )
              }
              )
            }
            </div>
          )
        }

        {/* Main content */}
        <main className="flex-1 bg-white w-full">{children}</main>
      </div>

      {/* Footer logo */}
      <div className="flex fixed right-6 bottom-6 z-20 justify-center items-center px-4 h-10 bg-white rounded-full shadow">
        <span className="mr-4 text-sm tracking-widest leading-none text-gray-300">&copy; 2023</span>
        {BRAND}
      </div>
    </div>
  )
}

function Profile() {
  return (
    <div className='flex items-center justify-end gap-2 h-full mt-2'>
      <p>{sessionStorage.username}</p>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </div>
  )
}

function MobileMenu() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <div onClick={() => setOpen(!open)} className='cursor-pointer'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>
      <div id="menu" className={cn('absolute mt-5 z-10 right-0 h-full bg-gray-900 w-0 transition-all duration-200 z-20', open && 'w-[200px]')}>
        <div className="flex flex-col justify-start items-center">
          {
            MENU.map((el, i) => {
              return (
              <NavLink key={i} className="h-16 w-full flex items-center text-white pl-2 hover:bg-gray-400 cursor-pointer" replace to={el} onClick={() => setOpen(!open)}>
                {capitalize(el)}
              </NavLink>
              )
            }
            )
          }
          </div>
      </div>
    </div>
  )
}
