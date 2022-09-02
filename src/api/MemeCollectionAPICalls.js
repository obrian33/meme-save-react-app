export const getMemeGroups = async (idtoken, user) => {
    let res = await fetch(`https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/getmemegroups?user=${user}`, {
        method: 'GET',
        mode : 'cors',
        headers : {
            'Authorization' : idtoken,
        }
    });

    let memeGroups = await res.json();
    return memeGroups;
}