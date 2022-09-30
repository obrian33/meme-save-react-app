import React, { useState } from 'react';
import jwt_decode from "jwt-decode";
import SuccessfullyAddedMemeModal from './SuccessfullyAddedMemeModal';
import { refreshTokenAPICallUnauthorized, setIDTokenFromRefreshResponse, getUserToken } from '../utilities/TokenHandling'
import { uploadMemeDataToDynamoDB, AddMemeWebCallBody } from "../api/AddMemeAPICalls/PostCalls";
import { uploadMemeToS3 } from "../api/AddMemeAPICalls/PutCalls";
import { v4 as uuidv4 } from 'uuid';
import { Form, Formik, Field, ErrorMessage, useFormik } from 'formik';
import * as Yup from 'yup';
import { checkIfMemeKeyIsUnique } from '../api/AddMemeAPICalls/GetCalls';

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
        let filename = createFileName(selectedFile);
        let body = AddMemeWebCallBody(memeKey, memeGroup, decodedIdToken.email, filename);

        try {

            await addMemeWebCalls(token, selectedFile, filename, body)


        } 
        catch(err) {
            console.log(err);
        }
	    
	};

    const handleBlur = (e) => {
        console.log(e)
        // f.setFieldError('memekey', 'hmmm');
        return 'not unique';
    }

    const handleFile = (e) => {
        
        console.log(e);
        return 'not unique';
    }

    const formik = useFormik({
        initialValues : {
        memekey: '', 
        file: '',
        },
        onSubmit: (values, helpers) => {
            helpers.setFieldError('memekey', 'not dcgun');
            //helpers.validateField('memekey');
            console.log(values);
            
        },
        validateOnChange : false,
        validationSchema: Yup.object({
            memekey : Yup.string()
            .required()
            .test('is-unique', 'key already exists', async (value) => {
                let token = getUserToken();
                let decodedIdToken = jwt_decode(token.id_token);
                let res = await checkIfMemeKeyIsUnique(token.id_token, value, decodedIdToken.email);
                let jbod = await res.json();
                return jbod.Items.length === 0;
            }),
            file: Yup.mixed()
            .required()
        })
    });

    return (

        <form onSubmit={formik.handleSubmit}>
            <div className='flex flex-col m-4 h-full'>
                <div className='flex flex-col justify-evenly items-center h-72'>
                    {validationError && <div>Error! </div>}
                    <div className='flex h-10 text-3xl text-lime-600'>
                        Add a new meme!
                    </div>
                    <div className='flex flex-row justify-between w-72'>
                        <div className="text-sm mr-1 after:content-['*'] after:ml-0.5 after:text-red-500 ">Meme Key:</div>
                        <div className='flex flex-col'>
                        <input onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.memekey} placeholder='Key must be unique!' id="memekey" name="memekey" type="text" className='invalid:border-2 invalid:border-red-500 invalid:placeholder:text-red-500 text-sm p-2 rounded-md h-6'></input>
                        {/* <input placeholder='Key must be unique!' onChange={(e) => setMemeKeyInput(e)} className='invalid:border-2 invalid:border-red-500 invalid:placeholder:text-red-500 text-sm p-2 rounded-md h-6'></input> */}
                        {formik.touched.memekey && formik.errors.memekey ? (
                            <div className='text-sm text-red-500'>{formik.errors.memekey}</div>
                        ) : null}
                        </div>
                    </div>
                    {/* <button type="button" onClick={() => formik.validateField('memekey')}>
             Check Username
           </button> */}
                    <div className='flex flex-row justify-between w-72'>
                        <div className='text-sm mr-1'>Meme Group:</div>
                        <input placeholder='Select a group!' onChange={(e) => setMemeGroupInput(e)} className='text-sm p-2 rounded-md h-6'></input>
                    </div>

                    <input onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.file} id="file" name="file" type="file" className="after:content-['*'] after:ml-0.5 after:text-red-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-full file:bg-lime-500 text-sm"></input>
                    {/* <input type="file" className="after:content-['*'] after:ml-0.5 after:text-red-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-full file:bg-lime-500 text-sm" onChange={(e) => changeHandler(e)}></input> */}
                    {formik.touched.file && formik.errors.file ? (
                            <div className='text-sm text-red-500'>{formik.errors.file}</div>
                        ) : null}
                    <button type="submit" className='bg-lime-700 text-lime-50 rounded-lg w-56 h-8'>Upload meme!</button> 
                    
                    <SuccessfullyAddedMemeModal isOpen={isSuccessful} setIsOpen={setSuccessfullyAdded} modalText={modalText} modalTitle={modalTitle}></SuccessfullyAddedMemeModal>

                </div>
            </div>
        </form>
        // )}
        // </Formik>
    );
}

export default AddMeme;