export let checkIfMemeKeyIsUnique = async (idtoken, phrase, user) => {
    return await fetch(`https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/checkmemekeyisunique?phrase=${phrase}&user=${user}`, {
        method : 'GET',
        mode : 'cors',
        headers : {
            'Authorization' : idtoken
        }
    });
}