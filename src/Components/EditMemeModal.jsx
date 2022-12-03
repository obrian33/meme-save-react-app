import { Dialog, Transition } from '@headlessui/react';
import { useState, Fragment } from 'react';
import { uploadMemeToS3 } from '../api/AddMemeAPICalls/PutCalls';
import { getUserToken } from '../utilities/TokenHandling';
import { AddMemeWebCallBody, uploadMemeDataToDynamoDB } from '../api/AddMemeAPICalls/PostCalls';
import { UpdateMemeGroup } from '../api/MemeCollectionAPICalls/PutCalls';
import { deleteDynamoDBEntry } from '../api/MemeCollectionAPICalls/DeleteCalls';
import { useForm } from "react-hook-form";
import jwt_decode from "jwt-decode";
import _ from 'lodash';
import { checkIfMemeKeyIsUnique } from '../api/AddMemeAPICalls/GetCalls';
import { useEffect } from 'react';
import Spinner from './Spinner';
import { BadgeCheckIcon, XCircleIcon } from '@heroicons/react/solid'

export const EditMemeModal = ({showEditModal, setShowEditModal, meme, setMemes, memes, newMemekey, setNewMemeKey, newMemegroup, setNewMemeGroup }) => {
    const [selectedFile, setSelectedFile] = useState();
    const [isCheckingMemeKey, setCheckingMemeKey] = useState(false);
    
    const { register, handleSubmit, getValues, reset, trigger, setValue, formState : { errors, isValidating, dirtyFields, isSubmitting }, getFieldState } = useForm({ mode: 'onSubmit', reValidateMode: 'onSubmit', defaultValues: {
      memekey: newMemekey,
      memegroup: newMemegroup,
      file: {}
  }});
  useEffect(() => {
      reset({memekey : newMemekey, memegroup: newMemegroup, file: {}})
  }, [newMemekey, newMemegroup]);

  
  const memekeyIsPristine = () => {
    return !errors.memekey && !isValidating && !getFieldState('memekey').isDirty;
  }

  const fileIsPristine = () => {
      return !getFieldState('file').isDirty &&  !errors.file;
  }
    
    let closeModal = () => {
        setShowEditModal(false);
    }

    const isOnlyS3ImageChanged = () => {
        return newMemekey === meme.memekey && newMemegroup === meme.memegroup && selectedFile;
    }

    const isOnlyMemeKeyChanged = () => {
        return newMemekey !== meme.memekey && newMemegroup === meme.memegroup && !selectedFile;
    }

    const isOnlyMemeGroupChanged = () => {
        return newMemekey === meme.memekey && newMemegroup !== meme.memegroup && !selectedFile;
    }

    const isMemeGroupAndImageChanged = () => {
        return meme.memegroup !== newMemegroup && selectedFile && meme.memekey === newMemekey;
    }

    const isMemeKeyAndImageChanged = () => {
        return meme.memegroup === newMemegroup && selectedFile && meme.memekey !== newMemekey;
    }

    const isMemeKeyAndImageChangedAndMemeGroupChanged = () => {
      return meme.memegroup !== newMemegroup && selectedFile && meme.memekey !== newMemekey;
    }

    const isMemeKeyAndMemeGroupChanged = () => {
      return meme.memekey !== newMemekey && meme.memegroup !== newMemegroup && !selectedFile;
    }

    const submitData = async () => {
      
      
        let parsedUserToken = getUserToken();

        if(isOnlyS3ImageChanged()) {
          // works but doesn't update with the new picture.
          await uploadMemeToS3(parsedUserToken.id_token, selectedFile, selectedFile.type, meme.s3key);
          let newMemes = [...memes];
          setMemes(newMemes);
        }

        if(isOnlyMemeKeyChanged()) {
          // works.
          await deleteDynamoDBEntry(parsedUserToken.id_token, meme.email, meme.memekey);
          let body = AddMemeWebCallBody(newMemekey, meme.memegroup, meme.email, meme.s3key);
          await uploadMemeDataToDynamoDB(parsedUserToken.id_token, body); // If present, you would delete and lose all data. Wanna re-insert.
          memes.splice(memes.indexOf(x => x.memekey === meme.memekey), 1);
          let newMemes = [...memes];
          meme.memekey = newMemekey;
          newMemes.push(meme);
          setMemes(newMemes);
        }

        if(isOnlyMemeGroupChanged()) {
          // doesn't work
          let putBody = AddMemeWebCallBody(meme.memekey, newMemegroup, meme.email, meme.s3key)
          await UpdateMemeGroup(parsedUserToken.id_token, putBody);
          memes.splice(memes.indexOf(x => x.memekey === meme.memekey), 1);
          meme.memegroup = newMemegroup;
          let newMemes = [...memes];
          newMemes.push(meme);
          setMemes(newMemes);
        }

        if(isMemeGroupAndImageChanged()) {
          let putBody = AddMemeWebCallBody(meme.memekey, newMemegroup, meme.email, meme.s3key)
          await UpdateMemeGroup(parsedUserToken.id_token, putBody);

          await uploadMemeToS3(parsedUserToken.id_token, selectedFile, selectedFile.type, meme.s3key);
          memes.splice(memes.indexOf(x => x.memekey === meme.memekey), 1);
          meme.memegroup = newMemegroup;
          let newMemes = [...memes];
          newMemes.push(meme);
          setMemes(newMemes);
        }

        if(isMemeKeyAndImageChanged()) {
          await uploadMemeToS3(parsedUserToken.id_token, selectedFile, selectedFile.type, meme.s3key);

          await deleteDynamoDBEntry(parsedUserToken.id_token, meme.email, newMemekey);
          let body = AddMemeWebCallBody(newMemekey, meme.memegroup, meme.email, meme.s3key);
          await uploadMemeDataToDynamoDB(parsedUserToken.id_token, body); // If present, you would delete and lose all data. Wanna re-insert.

          memes.splice(memes.indexOf(x => x.memekey === meme.memekey), 1);

          let newMemes = [...memes];
          meme.memekey = newMemekey;
          newMemes.push(meme);
          setMemes(newMemes);
        }

        if(isMemeKeyAndMemeGroupChanged()) {
          await deleteDynamoDBEntry(parsedUserToken.id_token, meme.email, newMemekey);

          let body = AddMemeWebCallBody(newMemekey, newMemegroup, meme.email, meme.s3key);
          await uploadMemeDataToDynamoDB(parsedUserToken.id_token, body); // If present, you would delete and lose all data. Wanna re-insert.

          memes.splice(memes.indexOf(x => x.memekey === meme.memekey), 1);

          let newMemes = [...memes];
          meme.memekey = newMemekey;
          meme.memegroup = newMemegroup;
          newMemes.push(meme);
          setMemes(newMemes);
        }

        if(isMemeKeyAndImageChangedAndMemeGroupChanged()) {
          await uploadMemeToS3(parsedUserToken.id_token, selectedFile, selectedFile.type, meme.s3key);

          await deleteDynamoDBEntry(parsedUserToken.id_token, meme.email, newMemekey);
  
          let body = AddMemeWebCallBody(newMemekey, newMemegroup, meme.email, meme.s3key);
          await uploadMemeDataToDynamoDB(parsedUserToken.id_token, body); // If present, you would delete and lose all data. Wanna re-insert.

          memes.splice(memes.indexOf(x => x.memekey === meme.memekey), 1);

          let newMemes = [...memes];
          meme.memekey = newMemekey;
          meme.memegroup = newMemegroup;
          newMemes.push(meme);
          setMemes(newMemes);

        }
        
        setShowEditModal(false);
    }
    
    return (<>

        <Transition appear show={showEditModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-lime-900 bg-opacity-25" />
            </Transition.Child>
  
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-lime-100 p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-lime-900"
                    >
                      Edit Meme
                    </Dialog.Title>
                    <div className="flex flex-col mt-2">
                      <div className="flex my-2">
                        <div className='text-sm mr-1'>
                            Memekey: 
                        </div>
                        <div className='flex items-center'>
                        <input className='p-2 rounded-md h-6' {...register('memekey', {
                            validate: async (value) => { 
                                
                                if(value === '') {
                                    return "Meme Key is required.";
                                }
                                let token = getUserToken();
                                let decodedIdToken = jwt_decode(token.id_token);
                                
                                setCheckingMemeKey(true);

                                let res = await checkIfMemeKeyIsUnique(token.id_token, value, decodedIdToken.email);
                                let json = await res.json();
                                
                                setCheckingMemeKey(false);
                                if (json.Items.length === 0) {
                                    return;
                                }
                                return "Meme key already exists!";
                            } 
                        }) } onChange={_.debounce((e) => {
                                setValue('memekey', e.target.value, { shouldDirty: true });
                                trigger('memekey');
                            }, 1000)
                        }></input> { isCheckingMemeKey && <Spinner/>
                        }
                                                    { !errors.memekey && !isValidating && !getFieldState('memekey').isDirty && <BadgeCheckIcon className='w-4 h-4 ml-2 text-gray-600'/>}
                            { !errors.memekey && !isValidating && !isSubmitting && getFieldState('memekey').isDirty && <BadgeCheckIcon className='w-4 h-4 ml-2 text-lime-700'/>}
                            { errors.memekey && !isValidating && <XCircleIcon className='w-4 h-4 ml-2 text-red-700'/>}
                            </div>
                      </div>
                      <div className="flex my-2">
                        <div className='text-sm mr-1'>
                            Memegroup: 
                        </div>
                        <input className='p-2 rounded-md h-6' {...register("memegroup")}></input>
                      </div>
                      <div className="flex my-2">
                        <div className='text-sm mr-1'>
                            New Image: <img className="w-28 m-2" src={`https://meme-save.s3.us-west-2.amazonaws.com/${meme.s3key}?${new Date().getTime()}`} alt='3'></img>
                        </div>
                        <input type="file" className='text-sm w-56'  onChange={(e) => setSelectedFile(e.target.files[0]) }></input>
                      </div>
                    </div>
  
                    <div className="mt-4">
                      <button
                        disabled={isValidating || isSubmitting || errors.memekey || errors.file || memekeyIsPristine() || fileIsPristine() }
                        type="button"
                        className={`inline-flex justify-center rounded-md border border-transparent ${isValidating || isSubmitting || errors.memekey || errors.file || memekeyIsPristine() || fileIsPristine()  ? "opacity-50" : "hover:bg-lime-200"} bg-lime-700 px-4 py-2 text-sm font-medium text-lime-50  focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2`}
                        onClick={() => submitData()}
                      >
                        Update meme
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </>);
}