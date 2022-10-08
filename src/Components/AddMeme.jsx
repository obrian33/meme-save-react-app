import React, { useState } from 'react';
import jwt_decode from "jwt-decode";
import SuccessfullyAddedMemeModal from './SuccessfullyAddedMemeModal';
import { refreshTokenAPICallUnauthorized, setIDTokenFromRefreshResponse, getUserToken } from '../utilities/TokenHandling'
import { uploadMemeDataToDynamoDB, AddMemeWebCallBody } from "../api/AddMemeAPICalls/PostCalls";
import { uploadMemeToS3 } from "../api/AddMemeAPICalls/PutCalls";
import { v4 as uuidv4 } from 'uuid';
import { checkIfMemeKeyIsUnique } from '../api/AddMemeAPICalls/GetCalls';
import { useForm } from "react-hook-form";
import _ from 'lodash';

const AddMeme = () => {
    const [isSuccessful, setSuccessfullyAdded] = useState(false);
    const [isCheckingMemeKey, setCheckingMemeKey] = useState(true);
    const [modalText, setModalText] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [hasRetried, setHasRetried] = useState(false);
    const [hasRetriedDynamoDB, setHasRetriedDynamoDB] = useState(false);
    const { register, handleSubmit, trigger, setValue, formState: { errors } } = useForm({ mode: 'onSubmit', reValidateMode: 'onSubmit'});

    const createFileName = (imageFile) => {
        return `${uuidv4()}.${getFileTypeExtension(imageFile)}`;
    }

    const getFileTypeExtension = (file) => {
        if(file.type === 'image/jpeg') {
            return 'jpg';
        }

        if(file.type === 'image/gif') {
            return 'gif';
        }

        if(file.type === 'image/heic') {
            return 'heic';
        }

        return 'png';
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

        // if(!isValid()) {
        //     setValidationError(true);
        //     return;
        // }
        
        let token = getUserToken();
        if(!token) {
            alert('YOU MUST BE SIGNED IN TO ADD MEMES');
            return;
        }
        // let decodedIdToken = jwt_decode(token.id_token);
        // let filename = createFileName(selectedFile);
        // let body = AddMemeWebCallBody(memeKey, memeGroup, decodedIdToken.email, filename);

        // try {

        //     await addMemeWebCalls(token, selectedFile, filename, body)


        // } 
        // catch(err) {
        //     console.log(err);
        // }
	    
	};

    return (

            <form onSubmit={ handleSubmit((data) => console.log(data))}>
            <div className='flex flex-col m-4 h-full'>
                <div className='flex flex-col justify-evenly items-center h-80'>                    
                    <div className='flex flex-col items-center h-20'>
                        <div className='flex text-3xl text-lime-600'>
                            Add a new meme!
                        </div>
                        <div className='flex text-sm sm:text-base text-lime-800'>
                            Memekey must be unique!
                        </div>
                        <div className='flex text-sm sm:text-base text-lime-800'>
                            File must be uploaded.
                        </div>
                    </div>

                    <div className='flex flex-row justify-between w-72'>
                        <div className="text-sm mr-1 after:content-['*'] after:ml-0.5 after:text-red-500 ">Meme Key:</div>
                        <div className='flex flex-col'>
                        <div className='flex'>
                        <input {...register('memekey', { validate: async (value) => { 

                            if(value === '') {
                                return false;
                            }
                            let token = getUserToken();
                            let decodedIdToken = jwt_decode(token.id_token);
                            setCheckingMemeKey(true);
                            // let res = await checkIfMemeKeyIsUnique(token.id_token, value, decodedIdToken.email);
                            // let json = await res.json();
                            // setCheckingMemeKey(false);
                            return false
                            // return json.Items.length === 0;
                            } 
                        }) } onChange={_.debounce((e) => {
                                setValue('memekey', e.target.value);
                                trigger('memekey');
                            }, 1000)
                        } placeholder='Key must be unique!' className='text-sm p-2 rounded-md h-6'></input>
                            { isCheckingMemeKey &&     <svg aria-hidden="true" class="w-5 h-8 text-lime-400 animate-spin fill-lime-600" viewBox="0 0 100 101">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>}

                        </div>
                        {errors.memekey && <span>This field is required</span>}
                        </div>
                    </div>

                    <div className='flex flex-row justify-between w-72'>
                        <div className='text-sm mr-1'>Meme Group:</div>
                        <input {...register('memegroup')} placeholder='Select a group!' className='text-sm p-2 rounded-md h-6'></input>
                    </div>

                    <input {...register('file', { required: true }) } type="file" className="after:content-['*'] after:ml-0.5 after:text-red-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-full file:bg-lime-500 text-sm"></input>
                    {errors.file && <span>This field is required</span>}
                    <button type="submit" className='bg-lime-700 text-lime-50 rounded-lg w-56 h-8'>Upload meme!</button> 
                    
                    <SuccessfullyAddedMemeModal isOpen={isSuccessful} setIsOpen={setSuccessfullyAdded} modalText={modalText} modalTitle={modalTitle}></SuccessfullyAddedMemeModal>

                </div>
            </div>
            </form>
    );
}

export default AddMeme;