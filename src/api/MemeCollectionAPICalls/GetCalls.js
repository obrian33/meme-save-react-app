export const getMemeGroups = async (idtoken, user) => {
    return fetch(`https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/getmemegroups?user=${user}`, {
        method: 'GET',
        mode : 'cors',
        headers : {
            'Authorization' : idtoken,
        }
    });
}