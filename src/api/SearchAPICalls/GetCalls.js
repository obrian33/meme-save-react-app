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

export const copyImage = async (idtoken, src) => {
    let blob = await fetch(`https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/meme-save/${src}`, {
        method: 'GET',
        mode : 'cors',
        headers : {
            'Authorization' : idtoken,
        }
    });
    let res = await blob.blob();
    const item = new window.ClipboardItem({"image/png": res});
    navigator.clipboard.write([item]);
}