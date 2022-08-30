
const Search = () => {
    const getSuggestions = (event) => {
        console.log(event.target.value);
    }

    
 
    return (
        <>
            
            <div className='flex flex-col m-4 h-full'>
                <div className='flex flex-col justify-evenly items-center h-40'>
                    <div className='text-lg text-lime-600 text-center font-semibold'> Look up your saved memes to send to friends!</div>
                    <input onChange={(e) => getSuggestions(e)} className='p-2 rounded-md w-48 h-6'></input>
                </div>
            </div>
        </>
    );
}

export default Search;