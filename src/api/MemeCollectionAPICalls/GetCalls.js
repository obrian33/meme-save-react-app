export const getMemeGroups = async (idtoken, user) => {
    return fetch(`https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/getmemegroups?user=${user}`, {
        method: 'GET',
        mode : 'cors',
        headers : {
            'Authorization' : idtoken,
        }
    });
}

export const getMemesPerGroup = async (idtoken, user, group) => {
    return fetch(`https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/getmemecollection?user=${user}&memegroup=${group}`, {
        method: 'GET',
        mode : 'cors',
        headers : {
            'Authorization' : idtoken,
        }
    });
}