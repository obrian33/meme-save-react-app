import { useState } from 'react';
import './App.css';

function App() {
  const [results, setResults] = useState([]);

  const getSuggestions = (event) => {
    console.log(event.target.value);
  }

  return (
    <div className="container flex flex-col mx-auto min-h-screen bg-lime-100">
      <div className='flex m-6 flex-col h-48 justify-evenly items-center'>
        <div className='text-lg text-lime-600 text-center font-semibold'> Look up your saved memes to send to friends!</div>
        <input onChange={(e) => getSuggestions(e)} className='p-2 rounded-md w-48 h-6'></input>

        {/* <button onClick={() => console.log(search)} className='text-lime-50 bg-lime-600 rounded-2xl w-36 h-8'>Search</button> */}
      </div>
    </div>
  );
}

export default App;
