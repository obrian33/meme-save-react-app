/* eslint-disable */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AddMeme from './Components/AddMeme';
import Collection from './Components/Collection';
import { createBrowserHistory } from 'history';
import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Search from './Components/Search';
import { isRedirectedLoginFlow, retrieveAccessCodeFromLoginFlow, getTokens } from './utilities/Login';

const history = createBrowserHistory();

let app = document.getElementById('root');
if (app) {

  if(isRedirectedLoginFlow(location)) {
    let accessCode = retrieveAccessCodeFromLoginFlow(location);
    localStorage.setItem('code', accessCode);
    history.replace('Search');
  } else {
    const path = (/\/(.*)$/.exec(location.pathname) || [])[1];
    if (path === '') {
      history.replace('Search');
    }
  }
}

const root = ReactDOM.createRoot(app);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />}>
        <Route path='Search' element={<Search />}/>
        <Route path='AddMeme' element={<AddMeme/>}/>
        <Route path='Collection' element={<Collection/>}/>
      </Route>
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
