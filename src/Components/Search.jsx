import { useState } from "react";
import { GetMemeSuggestions } from "../api/SearchAPICalls/GetCalls";
import { getUserToken } from "../utilities/TokenHandling";
import jwt_decode from 'jwt-decode';
import { copyImage } from "../api/SearchAPICalls/GetCalls";
import { useOutletContext } from "react-router-dom";

const SearchResult = ({ imgsrc, searchPhrase }) => {
    return <img onClick={() => (imgsrc.match(/png/g) ? copyImage(getUserToken().id_token, imgsrc) : () => {}) } className="w-28 m-2" src={`https://meme-save.s3.us-west-2.amazonaws.com/${imgsrc}`} alt={searchPhrase}></img>
}

const Search = () => {
    const [phrase, setPhrase] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [ signedIn ] = useOutletContext();

    const getSuggestions = (event) => {
        setPhrase(event.target.value);
        if(event.target.value !== '')  {
            getMemes(event.target.value);
        } else {
            setSearchSuggestions([]);
        }
    }

    const getMemes = async (phrase) => {
        let parsedToken = getUserToken();
        let decodedToken = jwt_decode(parsedToken.id_token);
        let memeResponse = await GetMemeSuggestions(parsedToken.id_token, phrase, decodedToken.email)

        let memeResults = await memeResponse.json();
        setSearchSuggestions(memeResults.Items);

    }
    
 
    return (
        <>
            
            <div className='flex flex-col m-4 '>
                <div className='flex flex-col h-96 items-center'>
                    <div className="h-24">
                        <div className='text-lg text-lime-600 text-center font-semibold'> Look up your saved memes to send to friends!</div>
                    </div>
                    <input hidden={!signedIn} disabled={!signedIn} onChange={(e) => getSuggestions(e)} className='p-2 rounded-md w-48 h-6 focus:outline-none focus:border-2 focus:border-lime-700 '></input>
                    <div className={`${ searchSuggestions.length === 0 ? 'hidden' : '' } flex justify-center overflow-y-auto flex-wrap mt-5 h-48`}>
                        {searchSuggestions.map((searchSuggestion) => {
                            return <SearchResult key={searchSuggestion.memekey} imgsrc={searchSuggestion.s3key} searchPhrase={phrase}></SearchResult>
                        })}
                    </div>
                    { !signedIn && <div className="animate-pulse bg-lime-500 rounded-xl p-4 text-lime-50">
                        You are not logged in!
                    </div> }
                </div>
            </div>
        </>
    );
}

export default Search;