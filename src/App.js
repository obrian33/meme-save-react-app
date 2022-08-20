import { useState, useEffect } from 'react';
import { LoginIcon } from '@heroicons/react/solid'
import './App.css';

function App() {
  const [results, setResults] = useState([]);

  const getSuggestions = (event) => {
    console.log(event.target.value);
  }

  return (
    <div className="container flex flex-col mx-auto min-h-screen bg-lime-100">
      
      <div className='flex flex-row justify-end'>
        <div className='hidden m-4 flex-row justify-center items-center bg-lime-600 rounded-2xl w-36 h-8'>
          <a className='text-lime-50' href='https://memesave.auth.us-west-2.amazoncognito.com/login?response_type=code&client_id=2si0r1d1pfqai8t91fl1hpd62i&redirect_uri=https://www.memesave.com'>sign in</a>
        </div>
        <div className='m-4'>
          <a className='text-lime-50' href='https://memesave.auth.us-west-2.amazoncognito.com/login?response_type=code&client_id=2si0r1d1pfqai8t91fl1hpd62i&redirect_uri=https://www.memesave.com'>
            <LoginIcon className='bg-lime-600 text-lime-50 rounded-lg w-16 h-8'></LoginIcon>
          </a>
        </div>
      </div>
      
      
      <div className='flex m-6 flex-col h-48 justify-evenly items-center'>
        <div className='text-lg text-lime-600 text-center font-semibold'> Look up your saved memes to send to friends!</div>
        <input onChange={(e) => getSuggestions(e)} className='p-2 rounded-md w-48 h-6'></input>
      </div>
        

      
    </div>
  );
}

export default App;
