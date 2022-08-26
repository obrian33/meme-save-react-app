import React, { useState } from 'react';


const AddMeme = () => {
    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [memeKey, setMemeKey] = useState('');
    const [memeGroup, setMemeGroup] = useState('');

    const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
        setIsFilePicked(true);
	};

    const setMemeKeyInput = (event) => {
        setMemeKey(event.target.value);
    }

    const setMemeGroupInput = (event) => {
        setMemeGroup(event.target.value);
    }

	const handleSubmission = (event) => {
        event.preventDefault();

        if(!isFilePicked) {
            return null;
        }

        if(!memeGroup) {
            return null;
        }

        if(!memeKey) {
            return null;
        }

        
		// formData.append('File', selectedFile);

		// fetch(
		// 	'https://obv030u051.execute-api.us-west-2.amazonaws.com/prod/addmeme',
		// 	{
		// 		method: 'POST',
		// 		body: formData,
		// 	}
		// )
        // .then((response) => response.json())
        // .then((result) => {
        //     console.log('Success:', result);
        // })
        // .catch((error) => {
        //     console.error('Error:', error);
        // });
	    
	};

    return (
        <div className='flex flex-col m-4 h-full'>
            <div className='flex flex-col justify-evenly items-center h-72'>
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