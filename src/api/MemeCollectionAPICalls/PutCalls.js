export const UpdateMemeGroup = async (idtoken, body) => {
    return fetch('https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/updatememe', {
        method : "PUT",
        mode : 'cors',
        body : JSON.stringify(body),
        headers : {
            'Authorization' : idtoken
        }
    });
}