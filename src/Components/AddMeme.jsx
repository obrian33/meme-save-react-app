import React, { useState } from 'react';
import jwt_decode from "jwt-decode";

const AddMeme = () => {
    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [memeKey, setMemeKey] = useState('');
    const [memeGroup, setMemeGroup] = useState('');
    const [validationError, setValidationError] = useState(false);

    const changeHandler = (event) => {
        setValidationError(false);
		setSelectedFile(event.target.files[0]);
        setIsFilePicked(true);
	};

    const setMemeKeyInput = (event) => {
        setValidationError(false);
        setMemeKey(event.target.value);
    }

    const setMemeGroupInput = (event) => {
        setValidationError(false);
        setMemeGroup(event.target.value);
    }

    const isValid = () => {
        return isFilePicked && memeGroup && memeKey;
    }

	const handleSubmission = async (event) => {
        event.preventDefault();

        if(!isValid()) {
            setValidationError(true);
            return;
        }
        
        let token = localStorage.getItem('token');
        let decoded = jwt_decode(token);
        let body = {
            memekey : memeKey,
            memegroup : memeGroup,
            email : decoded.email,
            s3key : selectedFile.name
        };

        let split = token.split('&');
        let idtoken = split[0].split('=')[1];

        try {
            let res = await fetch(
                'https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/addmeme',
                {
                    method: 'POST',
                    body: JSON.stringify(body),
                    mode : 'cors',
                    headers : {
                        'Authorization' : idtoken, 
                    },
                }
            );
            console.log(res);
        } 
        catch(err) {
            console.log(err);
        }
	    
	};

    return (
        <div className='flex flex-col m-4 h-full'>
            <div className='flex flex-col justify-evenly items-center h-72'>
                {validationError && <div>Error! </div>}
                <div className='flex h-10 text-3xl text-lime-600'>
                    Add a new meme!
                </div>
                <div className='flex flex-row justify-between w-72'>
                    <div className='text-sm mr-1'>Meme Key:</div>
                    <input required onChange={(e) => setMemeKeyInput(e)} className='p-2 rounded-md h-6'></input>
                </div>
                <div className='flex flex-row justify-between w-72'>
                    <div className='text-sm mr-1'>Meme Group:</div>
                    <input required onChange={(e) => setMemeGroupInput(e)} className='p-2 rounded-md h-6'></input>
                </div>

                <input type="file" className='text-sm w-56' onChange={(e) => changeHandler(e)}></input>
                <button className='bg-lime-700 text-lime-50 rounded-lg w-56 h-8' onClick={(e) => handleSubmission(e)}>Upload meme!</button> 
                
            </div>
        </div>
    );
}

export default AddMeme;