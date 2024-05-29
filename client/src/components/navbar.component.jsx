import React, { useContext, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

import logo from '../imgs/logo.png';
import { UserContext } from '../App';
import UserNavigationPanel from './user-navigation.component';

const Navbar = () => {
    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
    const [userNavPanel, setUserNavPanel] = useState(false);
    let navigate = useNavigate();
    
    const { userAuth, userAuth: { access_token, profile_img } } = useContext(UserContext);

    const handleUserNavPanel = () => {
        setUserNavPanel(prevVal => !prevVal);
    }

    const handleSearch = (e) => {
        let query = e.target.value;

        if (e.keyCode == 13 && query.length) {
            navigate(`/search/${query}`);
        }
    }

    const handleBlur = () => {
        setTimeout(() => {
            setUserNavPanel(prevVal => !prevVal);
        }, 200);
    }
  return (
    <>
        <nav className='navbar'>
            <Link to="/" className='flex-none w-10'>
                <img src={logo} alt="logo" />
            </Link>
            <div className={"absolute bg-white w-full left-0 top-full mt-0.5 border-b border-gray py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " + (searchBoxVisibility ? "show" : "hide")}>
                <input type="text"
                    placeholder='Search'
                    className='w-full md:w-auto bg-gray p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12'
                    onKeyDown={handleSearch}
                />
                <i className="fi fi-rr-search absolute right-[10%] md:pointer-event-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-gray"></i>
            </div>
            <div className='flex item-center gap-3 md:gap-6 ml-auto'>
                <button className='md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center' onClick={() => setSearchBoxVisibility(prevVal => !prevVal)}>
                    <i className="fi fi-rr-search text-xl"></i>
                </button>
                <Link to="/editor" className='hidden md:flex items-center gap-2 link'>
                    <i className="fi fi-rr-file-edit"></i>
                    <p>Write</p>
                </Link>
                { 
                    access_token ? 
                    <>
                        <Link to="/dashboard/notification">
                            <button className='w-12 h-12 mt-1 rounded-full bg-grey relative hover:bg-black/10'>
                                <i className="fi fi-rr-bell text-2xl block"></i>
                            </button>
                        </Link>
                        <div className='relative' onClick={handleUserNavPanel} onBlur={handleBlur}>
                            <button className='w-12 h-12 mt-1'>
                                <img src={profile_img} alt="Profile Img" className='w-full h-full object-cover rounded-full' />
                            </button>
                            { userNavPanel ?  <UserNavigationPanel /> : "" }
                        </div>
                    </>
                    :
                    <>
                        <Link className="btn-dark py-2" to="/signin">
                            Sign In
                        </Link>
                        <Link className="btn-light py-2 hidden md:block" to="/signup">
                            Sign Up
                        </Link>
                    </>
                }
            </div>
        </nav>
        <Outlet />
    </>
  )
}

export default Navbar;