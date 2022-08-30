import React, { useState } from 'react';
import jwt_decode from "jwt-decode";
import SuccessfullyAddedMemeModal from './SuccessfullyAddedMemeModal';
import { getParsedJWTToken, refreshTokenAPICallUnauthorized, setIDTokenFromRefreshResponse, getUserToken } from '../utilities/TokenHandling'
import { uploadMemeDataToDynamoDB } from "../api/AddMemeAPICalls/PostCalls";
import { uploadMemeToS3 } from "../api/AddMemeAPICalls/PutCalls";
import { v4 as uuidv4 } from 'uuid';

const AddMeme = () => {
    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [memeKey, setMemeKey] = useState('');
    const [memeGroup, setMemeGroup] = useState('');
    const [validationError, setValidationError] = useState(false);
    const [isSuccessful, setSuccessfullyAdded] = useState(false);
    const [modalText, setModalText] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [hasRetried, setHasRetried] = useState(false);
    const [hasRetriedDynamoDB, setHasRetriedDynamoDB] = useState(false);

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

    const failedToAddMeme = () => {
        setSuccessfullyAdded(true);
        setModalTitle('Meme unsuccessfully saved!');
    }

    const suceededToAddMeme = () => {
        setSuccessfullyAdded(true);
        setModalTitle('Meme Successfully saved!');
    }

    const dynamoDBWebCall = async (token, body) => {
        let dbResponse = await uploadMemeDataToDynamoDB(token.id_token, body);

        if(dbResponse.ok) {
            setHasRetriedDynamoDB(false);
            let result = await dbResponse.json();
            suceededToAddMeme();
            setModalText(result.result);
        } else {            
            if(dbResponse.status === 401 && !hasRetriedDynamoDB) {
                setHasRetriedDynamoDB(true);
                let refreshResponse = await refreshTokenAPICallUnauthorized(dbResponse);
                if(refreshResponse.status === 200) {
                    setIDTokenFromRefreshResponse(refreshResponse);
                    let parsedToken = getUserToken();
                    await dynamoDBWebCall(parsedToken, body)
                    
                } else {
                    failedToAddMeme();
                    // delete s3 added meme
                }
            } else {
                failedToAddMeme();
                // delete s3 added meme.
            }
        }
    }

    const addMemeWebCalls = async (token, selectedFile, filename, body) => {
        let s3Response = await uploadMemeToS3(token.id_token, selectedFile, selectedFile.type, filename);
            
        if(s3Response.ok) {
            setHasRetried(false);
            await dynamoDBWebCall(token, body);
        } else {
            if(s3Response.status === 401 && !hasRetried) {
                setHasRetried(true);
                let refreshResponse = await refreshTokenAPICallUnauthorized(s3Response);

                let x = await refreshResponse.json();
                console.log(x);
                if(refreshResponse.status === 200) {
                    setIDTokenFromRefreshResponse(refreshResponse);
                    let parsedToken = getUserToken();
                    await addMemeWebCalls(parsedToken, selectedFile, filename, body);
                    
                } else {
                    failedToAddMeme();
                }
            } else {
                failedToAddMeme();

            }

        }
    }

	const handleSubmission = async (event) => {
        event.preventDefault();

        if(!isValid()) {
            setValidationError(true);
            return;
        }
        
        let token = getUserToken();
        if(!token) {
            alert('YOU MUST BE SIGNED IN TO ADD MEMES');
            return;
        }
        let decodedIdToken = jwt_decode(token.id_token);
        let filename = `${uuidv4()}.png`;
        let body = {
            memekey : memeKey,
            memegroup : memeGroup,
            email : decodedIdToken.email,
            s3key : filename
        };

        try {

            await addMemeWebCalls(token, selectedFile, filename, body)


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
                
                <SuccessfullyAddedMemeModal isOpen={isSuccessful} setIsOpen={setSuccessfullyAdded} modalText={modalText} modalTitle={modalTitle}></SuccessfullyAddedMemeModal>

            </div>
        </div>
    );
}

export default AddMeme;