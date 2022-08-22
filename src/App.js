import { useState, useEffect } from 'react';
import { LoginIcon, LogoutIcon, MenuIcon } from '@heroicons/react/outline'
import Menu  from './Components/Menu';
import './App.css';
import jwt_decode from "jwt-decode";
 



function App() {
  //const [results, setResults] = useState([]);
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState('');
  const [menuVisibility, setMenuVisibility] = useState(false);
  
  const getSuggestions = (event) => {
    console.log(event.target.value);
  }

  const isTokenExpired = (expirationTime) => {
    return Date.now() >= expirationTime * 1000;
  }

  useEffect(() => {
    if(window.location.hash) {
      let hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
      hash = hash.substring(hash.indexOf('id_token'));
      localStorage.setItem('token', hash);
      let decoded = jwt_decode(hash);
      setSignedIn(true);
      setUser(decoded.email);
      //window.location = ''
    } else {
        // No hash found
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
    }

  }, [])




  return (
    <div className="container flex flex-col mx-auto h-screen bg-lime-100">
      <div className='flex flex-row h-full'>
        <div className={!menuVisibility ? 'hidden' : 'flex z-10 absolute h-screen'}>
          <Menu></Menu>
        </div>

        <div className='flex flex-col m-4 h-full'>
          <div className='flex flex-row justify-start items-center h-1/6'>
            
            <MenuIcon onClick={() => { setMenuVisibility(!menuVisibility) }} className={`bg-lime-600 text-lime-50 rounded-lg w-16 h-8 sm:hidden`}></MenuIcon>         
            
            
            {/* <div className='hidden m-4 flex-row justify-center items-center bg-lime-600 rounded-2xl w-36 h-8'>
              <a className='text-lime-50' href='https://memesave.auth.us-west-2.amazoncognito.com/login?response_type=token&client_id=2si0r1d1pfqai8t91fl1hpd62i&scope=email+openid+profile&redirect_uri=http://localhost:3000'>sign in</a>
            </div>
            <div className='m-4'>
              { !signedIn && <a className='text-lime-50' href='https://memesave.auth.us-west-2.amazoncognito.com/login?response_type=token&client_id=2si0r1d1pfqai8t91fl1hpd62i&redirect_uri=http://localhost:3000'>
                <LoginIcon className='bg-lime-600 text-lime-50 rounded-lg w-16 h-8'></LoginIcon>
              </a> }
              { signedIn && 
                <a onClick={() => {localStorage.removeItem('token'); setSignedIn(false); setUser('')}} href='https://memesave.auth.us-west-2.amazoncognito.com/logout?client_id=2si0r1d1pfqai8t91fl1hpd62i&logout_uri=http://localhost:3000'>
                  <LogoutIcon className='bg-lime-600 text-lime-50 rounded-lg w-16 h-8'></LogoutIcon>
                </a>
              }
            </div> */}

          </div>

        <div className='flex flex-col h-2/5 justify-evenly items-center'>
          <div className='text-lg text-lime-600 text-center font-semibold'> Look up your saved memes to send to friends!</div>
          <input onChange={(e) => getSuggestions(e)} className='p-2 rounded-md w-48 h-6'></input>
        </div>
      </div>


      </div>

      
    </div>
  );
}

export default App;
