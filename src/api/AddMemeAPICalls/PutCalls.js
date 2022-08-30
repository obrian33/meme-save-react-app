export const uploadMemeToS3 = async (idtoken, formData, fileType, filename) => {

    let upload = await fetch(`https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/meme-save/${filename}`,
    {
        method: 'PUT',
        body: formData,
        mode : 'cors',
        headers : {
            'Authorization' : idtoken,
            'Content-Type' : fileType
        }
    });

    return upload;
}