import { Dialog, Transition } from '@headlessui/react';
import { useState, Fragment } from 'react';
import { uploadMemeToS3 } from '../api/AddMemeAPICalls/PutCalls';
import { getUserToken } from '../utilities/TokenHandling';
import { AddMemeWebCallBody, uploadMemeDataToDynamoDB } from '../api/AddMemeAPICalls/PostCalls';
import { UpdateMemeGroup } from '../api/MemeCollectionAPICalls/PutCalls';
import { deleteDynamoDBEntry } from '../api/MemeCollectionAPICalls/DeleteCalls';

export const EditMemeModal = ({showEditModal, setShowEditModal, meme, setMemes, memes, newMemekey, setNewMemeKey, newMemegroup, setNewMemeGroup }) => {
    const [selectedFile, setSelectedFile] = useState();
    
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
          await deleteDynamoDBEntry(parsedUserToken.id_token, meme.email, newMemekey);
          let body = AddMemeWebCallBody(newMemekey, meme.memegroup, meme.email, meme.s3key);
          await uploadMemeDataToDynamoDB(parsedUserToken.id_token, body);
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
          await uploadMemeDataToDynamoDB(parsedUserToken.id_token, body);

          memes.splice(memes.indexOf(x => x.memekey === meme.memekey), 1);

          let newMemes = [...memes];
          meme.memekey = newMemekey;
          newMemes.push(meme);
          setMemes(newMemes);
        }

        if(isMemeKeyAndMemeGroupChanged()) {
          await deleteDynamoDBEntry(parsedUserToken.id_token, meme.email, newMemekey);

          let body = AddMemeWebCallBody(newMemekey, newMemegroup, meme.email, meme.s3key);
          await uploadMemeDataToDynamoDB(parsedUserToken.id_token, body);

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
          await uploadMemeDataToDynamoDB(parsedUserToken.id_token, body);

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
                        <input className='p-2 rounded-md h-6'  value={newMemekey} onChange={(e) => setNewMemeKey(e.target.value)}></input>
                      </div>
                      <div className="flex my-2">
                        <div className='text-sm mr-1'>
                            Memegroup: 
                        </div>
                        <input className='p-2 rounded-md h-6' value={newMemegroup} onChange={(e) => setNewMemeGroup(e.target.value)}></input>
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
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-lime-700 px-4 py-2 text-sm font-medium text-lime-50 hover:bg-lime-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2"
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