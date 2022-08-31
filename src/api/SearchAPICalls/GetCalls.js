export const GetMemeSuggestions = async (idtoken, phrase, user) => {
    let response = await fetch(`https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/getmemesuggestions?phrase=${phrase}&user=${user}`, 
    {
        method : 'GET',
        mode : 'cors',
        headers : {
            'Authorization' : idtoken
        }
    });

    return response;
}