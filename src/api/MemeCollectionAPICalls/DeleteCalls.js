export const deleteDynamoDBEntry = async (idtoken, user, memekey) => {
    return fetch(`https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/deletememe?user=${user}&memekey=${memekey}`, {
        method: 'DELETE',
        mode : 'cors',
        headers : {
            'Authorization' : idtoken
        }
    });
}

export const deleteS3Meme = async (idtoken, filename) => {
    return fetch(`https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/meme-save/${filename}`, {
        method: 'DELETE',
        mode : 'cors',
        headers : {
            'Authorization' : idtoken
        }
    });
}