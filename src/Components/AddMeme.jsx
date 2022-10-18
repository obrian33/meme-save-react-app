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
import Spinner from './Spinner';
import { BadgeCheckIcon, XCircleIcon } from '@heroicons/react/solid'

const AddMeme = () => {
    const [isSuccessful, setSuccessfullyAdded] = useState(false);
    const [isCheckingMemeKey, setCheckingMemeKey] = useState(false);
    const [modalText, setModalText] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [hasRetried, setHasRetried] = useState(false);
    const [hasRetriedDynamoDB, setHasRetriedDynamoDB] = useState(false);
    const { register, handleSubmit, getValues ,trigger, setValue, formState : { errors, isValidating, dirtyFields, isSubmitting }, getFieldState } = useForm({ mode: 'onSubmit', reValidateMode: 'onSubmit', defaultValues: {
        memekey: '',
        memegroup: '',
        file: {}
    }});

    
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
        console.log(getValues())
        // let token = getUserToken();
        // if(!token) {
        //     alert('YOU MUST BE SIGNED IN TO ADD MEMES');
        //     return;
        // }
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

    const memekeyIsValid = () => {
        return !errors.memekey && !isValidating && !getFieldState('memekey').isDirty;
    }

    return (

            <form onSubmit={ handleSubmission}>
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

                    <div className='flex flex-row items-center w-72'>
                        <div className="text-sm mr-1 after:content-['*'] after:ml-0.5 after:text-red-500 ">Meme Key:</div>
                        <div className='flex flex-col'>
                        <div className='flex items-center'>
                        <input {...register('memekey', {
                            validate: async (value) => { 
                                console.log(isSubmitting);
                                console.log(isValidating);
                                if(isSubmitting) {
                                    return
                                }
                                if(value === '') {
                                    return "Meme Key is required.";
                                }
                                // let token = getUserToken();
                                // let decodedIdToken = jwt_decode(token.id_token);
                                
                                setCheckingMemeKey(true);

                                let d = () => { return new Promise(resolve => {
                                    setTimeout(() => {
                                        resolve('resolved');
                                    }, 3000)
                                })};

                                console.log('before promise');
                                let res = await d();

                                console.log(res)
                                // let res = await checkIfMemeKeyIsUnique(token.id_token, value, decodedIdToken.email);
                                // let json = await res.json();
                                
                                setCheckingMemeKey(false);
                                
                                // return json.Items.length === 0;
                            } 
                        }) } onChange={_.debounce((e) => {
                                setValue('memekey', e.target.value, { shouldDirty: true });
                                trigger('memekey');
                            }, 1000)
                        } placeholder='Key must be unique!' className={`${ errors.memekey ? 'border-2 border-red-500 focus:outline-none focus:border-2 focus:border-red-500 focus-visible:border-red-500 focus-visible:border-2' : '' } focus:outline-none focus:border-2 focus:border-lime-700 text-sm p-2 rounded-md h-6`}></input>

                            { isCheckingMemeKey && <Spinner/>}
                            { !errors.memekey && !isValidating && !getFieldState('memekey').isDirty && <BadgeCheckIcon className='w-4 h-4 ml-2 text-gray-600'/>}
                            { !errors.memekey && !isValidating && !isSubmitting && getFieldState('memekey').isDirty && <BadgeCheckIcon className='w-4 h-4 ml-2 text-lime-700'/>}
                            { errors.memekey && !isValidating && <XCircleIcon className='w-4 h-4 ml-2 text-red-700'/>}
                            
                        </div>
                        {errors.memekey && <span className='text-xs text-red-700'>{errors.memekey.message}</span>}
                        </div>
                    </div>

                    <div className='flex flex-row w-72'>
                        <div className='text-sm mr-1'>Meme Group:</div>
                        <input {...register('memegroup')} placeholder='Select a group!' className='focus:outline-none focus:border-2 focus:border-lime-700 text-sm p-2 rounded-md h-6'></input>
                    </div>

                    <input {...register('file', { required: true }) } type="file" className="after:content-['*'] after:ml-0.5 after:text-red-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-full file:bg-lime-600 file:text-lime-50 text-sm"></input>
                    {errors.file && <span className='text-xs text-red-700'>This field is required</span>}
                    <button type="submit" disabled={ isValidating || isSubmitting || errors.memekey || errors.file || (memekeyIsValid() && (!getFieldState('file').isDirty &&  !errors.file)) } className={`${ isValidating || isSubmitting || (memekeyIsValid() || errors.memekey || errors.file || (!getFieldState('file').isDirty && !errors.file)) ? 'opacity-50' :  '' } bg-lime-700 text-lime-50 rounded-lg w-56 h-8 `}>Upload meme!</button> 
                    
                    <SuccessfullyAddedMemeModal isOpen={isSuccessful} setIsOpen={setSuccessfullyAdded} modalText={modalText} modalTitle={modalTitle}></SuccessfullyAddedMemeModal>

                </div>
            </div>
            </form>
    );
}

export default AddMeme;