export const uploadMemeDataToDynamoDB = async (idtoken, body) => {
    let response = await fetch(
        'https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/addmeme',
        {
            method: 'POST',
            body: JSON.stringify(body),
            mode : 'cors',
            headers : {
                'Authorization' : idtoken,
            }
        }
    );

    return response;
}