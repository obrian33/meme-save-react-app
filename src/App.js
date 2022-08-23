import { useState, useEffect } from 'react';
import { MenuIcon } from '@heroicons/react/outline'
import Menu  from './Components/Menu';
import './App.css';
import { Outlet } from 'react-router-dom';
import jwt_decode from "jwt-decode";



function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState('');
  const [menuVisibility, setMenuVisibility] = useState(false);
  


  const isTokenExpired = (expirationTime) => {
    return Date.now() >= expirationTime * 1000;
  }

  useEffect(() => {

    let token = localStorage.getItem('token');
    
    if(token) { 
      let decoded = jwt_decode(token);
      if(isTokenExpired(decoded.exp)) {
        localStorage.removeItem('token');
        setUser('');
        setSignedIn(false);
      } else {
        setSignedIn(true);
        setUser(decoded.email);
      }
    } else {
      setUser('');
      setSignedIn(false);
    }
  }, [])

  return (
    <div className="container flex flex-col mx-auto h-screen bg-lime-100">
      <div className='flex flex-col h-full'>
        <div className={ !menuVisibility ? 'hidden' : 'flex z-10 absolute h-screen'}>
            <Menu menuVisibility={menuVisibility} setMenuVisibility={ setMenuVisibility } signedIn={signedIn} setSignedIn={setSignedIn}></Menu>
        </div>

        <div className='flex flex-row justify-start m-4'>
          <MenuIcon onClick={() => { setMenuVisibility(!menuVisibility) }} className={`bg-lime-600 text-lime-50 rounded-lg w-16 h-8 sm:hidden`}></MenuIcon>         
        </div>
        <Outlet context={[user]}/>
      </div>
    </div>
  );
}

export default App;
