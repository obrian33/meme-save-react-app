import { Fragment, useEffect, useState } from "react";
import { getUserToken } from '../utilities/TokenHandling'
import { getMemeGroups, getMemesPerGroup } from "../api/MemeCollectionAPICalls/GetCalls";
import { Listbox, Transition } from "@headlessui/react";
import jwt_decode from 'jwt-decode';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import { PencilIcon, TrashIcon } from "@heroicons/react/outline";
import { deleteDynamoDBEntry, deleteS3Meme } from "../api/MemeCollectionAPICalls/DeleteCalls";
import { EditMemeModal } from "./EditMemeModal";

const Meme = ({src, memekey, setMemes, memes, showEditModal, setShowEditModal, setSelectedMeme, meme, setNewMemeGroup, setNewMemeKey }) => {
    return (
        <div className="flex flex-col">
            <img className="w-28 m-2" src={`https://meme-save.s3.us-west-2.amazonaws.com/${src}?${new Date().getTime()}`} alt='3'></img>
            <div className="flex justify-around">
                <PencilIcon onClick={() => { setNewMemeGroup(meme.memegroup); setNewMemeKey(meme.memekey); setSelectedMeme(meme); setShowEditModal(!showEditModal); } } className="w-5"></PencilIcon>
                <TrashIcon onClick={() => DeleteMemeWebCalls(memekey, src, setMemes, memes)} className="w-5"></TrashIcon>
            </div>
        </div>
    );
}

const DeleteMemeWebCalls = async (memekey, s3key, setMemes, memes) => {
    let token = getUserToken();
    let decodedIDToken = jwt_decode(token.id_token);
    let deleteDynamoDBEntryResponse = await deleteDynamoDBEntry(token.id_token, decodedIDToken.email, memekey);

    if(deleteDynamoDBEntryResponse.ok) {
        let deleteS3Response = await deleteS3Meme(token.id_token, s3key);
        if(deleteS3Response.ok) {
            let memeIndex = memes.findIndex(x => x.memekey === memekey);
            memes.splice(memeIndex, 1);
            let newMemes = [...memes];
            setMemes(newMemes);
        }
    }
}

const Collection = () => {
    const [memeGroups, setMemeGroups] = useState([]);
    const [selected, setSelected] = useState();
    const [memes, setMemes] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMeme, setSelectedMeme] = useState({});
    const [newMemekey, setNewMemeKey] = useState('');
    const [newMemegroup, setNewMemeGroup] = useState('');

    useEffect(() => {
        
        let getGroups = async () => {
            let parsedToken = getUserToken();
            
            let decodedIDToken = jwt_decode(parsedToken.id_token);
            
            let memeGroupsResponse = await getMemeGroups(parsedToken.id_token, decodedIDToken.email);
            let memeGroups = await memeGroupsResponse.json();
            
            setMemeGroups(memeGroups);
            setSelected(memeGroups[0]);

            let memesByGroupsResponse = await getMemesPerGroup(parsedToken.id_token, decodedIDToken.email, memeGroups[0]);
            let memesByGroup = await memesByGroupsResponse.json();

            setMemes(memesByGroup.Items);
        };

        getGroups();
    }, []);

    let getMemesBySelectedGroup = async (selectedGroup) => {
        setSelected(selectedGroup);

        let parsedToken = getUserToken();
            
        let decodedIDToken = jwt_decode(parsedToken.id_token);

        let getMemesPerGroupResponse = await getMemesPerGroup(parsedToken.id_token, decodedIDToken.email, selectedGroup);
        let memesPerGroup = await getMemesPerGroupResponse.json();
        
        setMemes(memesPerGroup.Items);
    }
    
    return (
        <div className="flex justify-center">
            <div className="flex items-center flex-col">
                <div className="my-4 text-lime-700 text-3xl">Meme Groups</div>
                <Listbox value={selected} onChange={(e) => getMemesBySelectedGroup(e)}>
                    <div className="relative mt-1">
                    <Listbox.Button className="h-9 relative w-72 cursor-default rounded-lg bg-lime-50 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-lime-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-lime-300 sm:text-sm">
                        <span className="block truncate">{selected}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <SelectorIcon
                            className="h-5 w-5 text-lime-600"
                            aria-hidden="true"
                        />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-lime-50 py-1 text-base shadow-lg ring-1 ring-lime-900 ring-opacity-5 focus:outline-none sm:text-sm">
                        {memeGroups.map((person, personIdx) => (
                            <Listbox.Option
                            key={personIdx}
                            className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-lime-100 text-lime-900' : 'text-lime-900'
                                }`
                            }
                            value={person}
                            >
                            {({ selected }) => (
                                <>
                                <span
                                    className={`block truncate ${
                                    selected ? 'font-medium' : 'font-normal'
                                    }`}
                                >
                                    {person}
                                </span>
                                {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-lime-600">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                ) : null}
                                </>
                            )}
                            </Listbox.Option>
                        ))}
                        </Listbox.Options>
                    </Transition>
                    </div>
                </Listbox>
                <div className="flex justify-center overflow-y-auto flex-wrap mt-5 h-48">
                {memes.map((x, idx) => {
                    return <Meme key={idx} src={x.s3key} memekey={x.memekey} setMemes={setMemes} memes={memes} showEditModal={showEditModal} setShowEditModal={setShowEditModal} setSelectedMeme={setSelectedMeme} meme={x} setNewMemeGroup={setNewMemeGroup} setNewMemeKey={setNewMemeKey}></Meme>
                } )}

                <EditMemeModal showEditModal={showEditModal} setShowEditModal={setShowEditModal} meme={selectedMeme} setMemes={setMemes} memes={memes} newMemekey={newMemekey} setNewMemeKey={setNewMemeKey} newMemegroup={newMemegroup} setNewMemeGroup={setNewMemeGroup}></EditMemeModal>
                </div>
            </div>
        </div>
    );
}

export default Collection;