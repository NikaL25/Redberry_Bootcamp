import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { LoginModal, RegisterModal } from '../modals/AuthModals'
import ProfileModal from '../modals/ProfileModal'
import EnrolledSidebar from '../modals/EnrolledSidebar'

import IconEnrolled from '../../assets/NavIconEnrolled.png'
import IconBrowse from '../../assets/NavIconBrowse.png'

import logo from '../../assets/Logo.png'
import facebook from '../../assets/Facebook.png'
import twitter from '../../assets/Twitter.png'
import instagram from '../../assets/Instagram.png'
import linkedin from '../../assets/LinkedIn.png'
import youtube from '../../assets/YouTube.png'

import EmailIcon from '../../assets/Email.png'
import PhoneIcon from '../../assets/Phone.png'
import AddressIcon from '../../assets/Address.png'

import AvatarIcon from '../../assets/Avatar.png'

function Header() {
  const { isAuthenticated, user, openModal, logout } = useApp()
  const navigate = useNavigate()

  return (
<header className="sticky top-0 z-50 border-b border-[#D1D1D1] bg-[#F5F5F5] p-3 w-full">
        <div className="mx-auto flex h-20 max-w-page items-center justify-between px-6">
        <Link className="text-xl font-extrabold text-brand-primary" to="/">
          <img
          src={logo}
          alt="hero slide"
          className="h-[60px] w-[60px] object-cover"
        />
        </Link>
          <nav className="flex items-center  gap-6 text-sm font-semibold">
            <div className="flex items-center">
        <img
          src={IconBrowse}
          className="mr-2 -translate-y-[1px]"
        />

    <Link
      className="text-gray-600 text-[20px] hover:text-brand-primary"
      to="/courses"
    >
      Browse Courses
    </Link>
</div>
          {!isAuthenticated ? (
            <>
            <button 
  className="text-gray-600 text-[20px] h-[60px] w-[114px] border border-[#5448C8] rounded-lg hover:text-brand-primary hover:border-brand-primary transition-colors" 
  onClick={() => openModal('login')}
>
  Log In
</button>
              <button className="rounded-lg bg-[#4F46E5] h-[60px] w-[125px] text-[20px] px-4 py-2 text-white" onClick={() => openModal('register')}>
                Sign Up
              </button>
            </>
          ) : (
            <>

             <div className='flex'>
              <img src={IconEnrolled} className='mr-2'/>
              <button className="text-gray-600 text-[20px] hover:text-brand-primary" onClick={() => openModal('enrolledSidebar')}>
                Enrolled Courses
              </button>
             </div>
             <button
  className="flex items-center gap-2 text-gray-600 hover:text-brand-primary"
  onClick={() => openModal('profile')}
>
  <img
    src={user?.avatar ?? AvatarIcon}
    alt="avatar"
    className="h-8 w-8 rounded-full object-cover"
  />
</button>
              <button
                className="rounded-lg border border-brand-primary px-4 py-2 text-brand-primary"
                onClick={async () => {
                  await logout()
                  navigate('/')
                }}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-20 border-t bg-[#F5F5F5] py-8">
      <div className="mx-auto max-w-page px-6 text-sm text-gray-500 ">
        <div className='flex  justify-between'>
          <div className='flex-col  w-500px'>
            
          <div className='flex'>
            <Link className="text-xl font-extrabold text-brand-primary" to="/">
              <img
              src={logo}
              alt="hero slide"
              className="h-[60px] w-[60px] object-cover"
            />
            </Link>
             <p className='text-[#130E67] m-5 font-bold  text-xl'>Bootcamp</p>
          </div>
          <p className='w-[250px] text-[#130E67] text-[14px] mt-1'>Your learning journey starts here! 
                    Browse courses to get started.</p>

        <div className='flex mt-1'>
        <Link className="text-xl font-extrabold text-brand-primary" to="/">
          <img
          src={facebook}
          alt="hero slide"
          className="w-[19px] h-[18px] object-contain mt-3"
        />
        </Link>

          <Link className="text-xl font-extrabold text-brand-primary" to="/">
          <img
          src={twitter}
          alt="hero slide"
          className="w-[19px] h-[18px] object-contain m-3"
        />
        </Link>

          <Link className="text-xl font-extrabold text-[#130E67]" to="/">
          <img
          src={instagram}
          alt="hero slide"
          className="w-[19px] h-[18px] object-contain m-3"
        />
        </Link>

          <Link className="text-xl font-extrabold text-[#130E67]" to="/">
          <img
          src={linkedin}
          alt=""
          className="w-[19px] h-[18px] object-contain m-3"
        />
        </Link>

          <Link className="text-xl font-extrabold text-[#130E67]" to="/">
          <img
          src={youtube}
          alt="hero slide"
          className='w-[19px] h-[18px] object-contain m-3'
        />
        </Link>
  </div>
          </div>


          <div className='flex  w-[700px] justify-between'>
              <div className='flex-col  w-[144px] h-[92px]'>
                <p className='text-[#130E67] text-[20px] font-bold'>Explore</p>
                <p className='mt-[16px] text-[18px] text-gray-500'>Enrolled Courses</p>
                <p className='mt-[8px] text-[18px] text-gray-500'>Browse Courses</p>
              </div>
              <div className='flex-col  w-[86px] h-[62px]'>
                <p className='text-[#130E67] text-[20px] font-bold'>Account</p>
                <p className='mt-[16px] text-[18px] text-gray-500'>My Profile</p>
              </div>
              <div className='flex-col  w-[230px] h-[130px]'>
                  <p className='text-[#130E67] text-[20px] font-bold'>Account</p>
                  
                  <div className='flex mt-[16px]'>
                    <img src={EmailIcon}
                    className="object-contain mr-2 "
                    />
                    <Link to={'https://gmail.com/'}>
                    <p className="text-[18px] text-gray-500">contact@company.com </p>            
                    </Link>
                  </div>
            
                <div className='flex'>
                      <img src={PhoneIcon}
                         className="object-contain mt-3 mr-1"       
                      />
                     <p className='mt-[16px] text-[18px] text-gray-500'>(+995) 555 111 222</p>
                </div>
              
              <div className='flex'>
                   <img src={AddressIcon}
                      className="object-contain mt-3 mr-1"
                   />
                   <p className='mt-[16px] text-[18px] text-gray-500'>Aghmashenebeli St.115</p>
              </div>
                 


              </div>
          </div>
        
        </div>
       
      

      <div className='flex justify-between'>
        <p className='mt-10 text-[18px] text-gray-500'>Copyright © 2026 Redberry International</p>

        <p className='mt-10 text-[18px] text-gray-500'>All Rights Reserved | <a className='text-purple-500' href='/'>Terms and Conditions | Privacy Policy</a> </p>
      </div>
 


      </div>
     
    </footer>
  )
}

export default function AppLayout() {
  const { toast } = useApp()

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />
      <main className="mx-auto max-w-page px-6 py-10">
        <Outlet />
      </main>
      <Footer />
      <LoginModal />
      <RegisterModal />
      <ProfileModal />
      <EnrolledSidebar />
      {toast && (
        <div
          className={`fixed bottom-5 right-5 rounded-lg px-4 py-3 text-sm font-semibold text-white ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
