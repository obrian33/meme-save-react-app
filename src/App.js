import { useState, useEffect } from 'react';
import { MenuIcon } from '@heroicons/react/outline'
import Menu  from './Components/Menu';
import './App.css';
import { Outlet } from 'react-router-dom';
import jwt_decode from "jwt-decode";
import { getParsedJWTToken, getUserToken } from './utilities/TokenHandling';
import { isTokenExpired, getRefreshedCredentials, setIDTokenFromRefreshResponse } from './utilities/TokenHandling'
import { getTokens } from './utilities/Login';
import { Transition } from '@headlessui/react';


function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState('');
  const [menuVisibility, setMenuVisibility] = useState(false);

  const clearAllUserCredentials = () => {
    setUser('');
    setSignedIn(false);
    localStorage.clear();
  }

  const setUserCredentials = (response) => {
    if(response.ok) {
      setIDTokenFromRefreshResponse(response);
      setSignedIn(true);
    } else {
      clearAllUserCredentials();
    }
  }

  useEffect(() => {

    let token = localStorage.getItem('token');
    let accessCode = localStorage.getItem('code');
    
    if(token && token !== '{}') { 
      
      let parsedToken = getParsedJWTToken(token);
      let parsedIDToken = jwt_decode(parsedToken.id_token)
      
      if(isTokenExpired(parsedIDToken.auth_time, parsedIDToken.exp)) {

        if(parsedToken.refresh_token) {
          getRefreshedCredentials(parsedToken.refresh_token)
          .then((res) => {
            setUserCredentials(res);
          })
          .catch((err) => {
            clearAllUserCredentials();
          });
        } else {
          clearAllUserCredentials();
        }
      } else {
        setSignedIn(true);
      }
    } else if(accessCode) {
      let res = getTokens(accessCode);

      res.then((res) => {
        
        res.json().then((result) => {
          localStorage.setItem('token', JSON.stringify(result));
          setSignedIn(true);
        })
        
      });
      localStorage.removeItem('code');
    } else {
      clearAllUserCredentials()
    }

  }, []);
  


  return (
    <div className="flex flex-col mx-auto h-screen bg-lime-100">
      <div className='flex flex-col'>
          <Transition 
          className={ 'flex z-20 absolute h-screen'}
          show={menuVisibility}
          enter="transition ease duration-700 transform"
          enterFrom="opacity-100 -translate-x-full"
          enterTo="opacity-100 translate-x-0"
          leave="transition ease duration-1000 transform"
          leaveFrom="opacity-100 translate-x-0"
          leaveTo="opacity-100 -translate-x-full"
        >
            <Menu menuVisibility={menuVisibility} setMenuVisibility={ setMenuVisibility } signedIn={signedIn} setSignedIn={setSignedIn}></Menu>
          </Transition>

        <div className='flex flex-row justify-start m-4'>
          <MenuIcon onClick={() => { setMenuVisibility(!menuVisibility) }} className={`bg-lime-600 text-lime-50 rounded-lg w-16 h-8 `}></MenuIcon>   
          {!signedIn && <span className="animate-ping rounded-full p-2 bg-lime-400 absolute left-16"></span> }
        </div>
        
        <Outlet context={[signedIn]}/>
      </div>
    </div>
  );
}

export default App;
