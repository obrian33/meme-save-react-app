import { Fragment, useEffect, useState } from "react";
import { getUserToken } from '../utilities/TokenHandling'
import { getMemeGroups } from "../api/MemeCollectionAPICalls/GetCalls";
import { Listbox, Transition } from "@headlessui/react";
import jwt_decode from 'jwt-decode';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'

const Collection = () => {
    const [memeGroups, setMemeGroups] = useState([]);
    const [selected, setSelected] = useState('');

    useEffect(() => {

        
        let getGroups = async () => {
            let parsedToken = getUserToken();
            
            let decodedIDToken = jwt_decode(parsedToken.id_token);
            
            let memeGroupsResponse = await getMemeGroups(parsedToken.id_token, decodedIDToken.email);
            let memeGroups = await memeGroupsResponse.json();
            
            setMemeGroups(memeGroups);
            setSelected(memeGroups[0]);
        };

        getGroups();
    }, [])
    
    return (
        <div className="flex justify-center">
            <div className="flex items-center flex-col">
                <div className="my-4 text-lime-700 text-3xl">Meme Groups</div>
                <Listbox value={selected} onChange={setSelected}>
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
            </div>
        </div>
    );
}

export default Collection;