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

    const isOnlyS3ImageChanged = (val) => {
      
      return val.memekey === meme.memekey && val.memegroup === meme.memegroup && val.file[0];
    }

    const isOnlyMemeKeyChanged = (val) => {
      
      return val.memekey !== meme.memekey && val.memegroup === meme.memegroup && !val.file[0];
    }

    const isOnlyMemeGroupChanged = (val) => {
      return val.memekey === meme.memekey && val.memegroup !== meme.memegroup && !val.file[0];
    }

    const isMemeGroupAndImageChanged = (val) => {
        return meme.memegroup !== val.memegroup && val.file[0] && meme.memekey === val.memekey;
    }

    const isMemeKeyAndImageChanged = (val) => {
      return meme.memegroup === val.memegroup && val.file[0] && meme.memekey !== val.memekey;
    }

    const isMemeKeyAndImageChangedAndMemeGroupChanged = (val) => {
      return meme.memegroup !== val.memegroup && val.file[0] && meme.memekey !== val.memekey;
    }

    const isMemeKeyAndMemeGroupChanged = (val) => {
      return meme.memekey !== val.memekey && meme.memegroup !== val.memegroup && !val.file[0];
    }

    const submitData = async () => {
      let parsedUserToken = getUserToken();
      let val = getValues(); // Need to do full integration test with each function.

      if(isOnlyS3ImageChanged(val)) { // Works!
        await uploadMemeToS3(parsedUserToken.id_token, val.file[0], val.file[0].type, meme.s3key);
        let newMemes = [...memes];
        setMemes(newMemes);
      }

      if(isOnlyMemeKeyChanged(val)) { // Works!
        await deleteDynamoDBEntry(parsedUserToken.id_token, meme.email, meme.memekey);
        let body = AddMemeWebCallBody(val.memekey, meme.memegroup, meme.email, meme.s3key);
        await uploadMemeDataToDynamoDB(parsedUserToken.id_token, body); // If present, you would delete and lose all data. Wanna re-insert.
        memes.splice(memes.findIndex(x => x.memekey === meme.memekey), 1);
        let newMemes = [...memes];
        meme.memekey = val.memekey;
        newMemes.push(meme);
        setMemes(newMemes);
      }

      if(isOnlyMemeGroupChanged(val)) { // Works!
        let putBody = AddMemeWebCallBody(meme.memekey, val.memegroup, meme.email, meme.s3key)
        await UpdateMemeGroup(parsedUserToken.id_token, putBody);
        memes.splice(memes.findIndex(x => x.memekey === meme.memekey), 1);
        
        let newMemes = [...memes];
        
        setMemes(newMemes);
      }

      if(isMemeGroupAndImageChanged(val)) { // Works! BUT when any group change, it needs to disappear from the group.
        let putBody = AddMemeWebCallBody(meme.memekey, val.memegroup, meme.email, meme.s3key)
        await UpdateMemeGroup(parsedUserToken.id_token, putBody);

        await uploadMemeToS3(parsedUserToken.id_token, val.file[0], val.file[0].type, meme.s3key);
        memes.splice(memes.findIndex(x => x.memekey === meme.memekey), 1);
        
        let newMemes = [...memes];        
        setMemes(newMemes);
      }

      if(isMemeKeyAndImageChanged(val)) { // Works!
        await uploadMemeToS3(parsedUserToken.id_token, val.file[0], val.file[0].type, meme.s3key);

        await deleteDynamoDBEntry(parsedUserToken.id_token, meme.email, meme.memekey);
        let body = AddMemeWebCallBody(val.memekey, meme.memegroup, meme.email, meme.s3key);
        await uploadMemeDataToDynamoDB(parsedUserToken.id_token, body); // If present, you would delete and lose all data. Wanna re-insert.

        memes.splice(memes.findIndex(x => x.memekey === meme.memekey), 1);

        let newMemes = [...memes];
        meme.memekey = val.memekey;
        newMemes.push(meme);
        setMemes(newMemes);
      }

      if(isMemeKeyAndMemeGroupChanged(val)) { // Works! When changing groups, you double add it to the prior group.
        await deleteDynamoDBEntry(parsedUserToken.id_token, meme.email, meme.memekey);

        let body = AddMemeWebCallBody(val.memekey, val.memegroup, meme.email, meme.s3key);
        await uploadMemeDataToDynamoDB(parsedUserToken.id_token, body); // If present, you would delete and lose all data. Wanna re-insert.

        memes.splice(memes.findIndex(x => x.memekey === meme.memekey), 1);

        let newMemes = [...memes];
        setMemes(newMemes);
      }

      if(isMemeKeyAndImageChangedAndMemeGroupChanged(val)) { // Works! When changing groups, you double add it to the prior group.
        await uploadMemeToS3(parsedUserToken.id_token, val.file[0], val.file[0].type, meme.s3key);

        await deleteDynamoDBEntry(parsedUserToken.id_token, meme.email, meme.memekey);

        let body = AddMemeWebCallBody(val.memekey, val.memegroup, meme.email, meme.s3key);
        await uploadMemeDataToDynamoDB(parsedUserToken.id_token, body); // If present, you would delete and lose all data. Wanna re-insert.

        memes.splice(memes.findIndex(x => x.memekey === meme.memekey), 1);

        let newMemes = [...memes];
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
                        }></input> { isCheckingMemeKey && <Spinner/>}
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
                        <input type="file" className='text-sm w-56' {...register("file")}></input>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <button
                        disabled={isValidating || isSubmitting || errors.memekey || errors.file || (memekeyIsPristine() && fileIsPristine() && !getFieldState('memegroup').isDirty && !getFieldState('file').isDirty) }
                        type="button"
                        className={`inline-flex justify-center rounded-md border border-transparent ${isValidating || isSubmitting || errors.memekey || errors.file || (memekeyIsPristine() && fileIsPristine() && !getFieldState('memegroup').isDirty && !getFieldState('file').isDirty)  ? "opacity-50" : "hover:bg-lime-200"} bg-lime-700 px-4 py-2 text-sm font-medium text-lime-50  focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2`}
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