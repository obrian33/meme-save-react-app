import { MenuIcon } from "@heroicons/react/outline";
import { NavLink, Outlet } from "react-router-dom";

const MenuItem = ({item, setMenuVisibility, menuVisibility}) => {
    return (
        <div className='h-8 text-sm m-4 text-lime-50'>
            <NavLink onClick={() => {setMenuVisibility(!menuVisibility)}} className='h-8 text-sm mt-4 mr-4 text-lime-50' to={item.link}>{item.title}</NavLink>
        </div>
    );
};

const getLoginUrls = (signedIn) => {
    return !signedIn ? `https://memesave.auth.us-west-2.amazoncognito.com/login?response_type=code&client_id=${ process.env.NODE_ENV === 'development' ? process.env.REACT_APP_USER_POOL_DEV : process.env.REACT_APP_USER_POOL_PROD }&redirect_uri=${ process.env.NODE_ENV === 'development' ? process.env.REACT_APP_USER_POOL_REDIRECT_DEV : process.env.REACT_APP_USER_POOL_REDIRECT_PROD }` 
    : `https://memesave.auth.us-west-2.amazoncognito.com/logout?client_id=${ process.env.NODE_ENV === 'development' ? process.env.REACT_APP_USER_POOL_DEV : process.env.REACT_APP_USER_POOL_PROD }&logout_uri=${ process.env.NODE_ENV === 'development' ? process.env.REACT_APP_USER_POOL_REDIRECT_DEV : process.env.REACT_APP_USER_POOL_REDIRECT_PROD }`;
}

const Menu = ({setMenuVisibility, menuVisibility, signedIn, setSignedIn}) => {
    let menuItems = [
        {
            title : 'Search',
            link : '/Search',
        }, 
        {
            title : 'Meme Collection',
            link : '/Collection',
        }, 
        {
            title : 'Add Meme',
            link : '/AddMeme',
        },
    ];

    return (<div className="flex bg-lime-800">
            <MenuIcon onClick={() => { setMenuVisibility(!menuVisibility) }} className={`text-lime-50 rounded-lg w-16 h-8 mt-4`}></MenuIcon>       
            <div>
                { menuItems.map((x,idx) => <MenuItem key={idx} item={x} setMenuVisibility={setMenuVisibility} menuVisibility={menuVisibility}></MenuItem>)}
                <div className='h-8 text-sm m-4 text-lime-50'>
                    <a onClick={() => { localStorage.clear(); setSignedIn(false); }} href={getLoginUrls(signedIn)}>{!signedIn ? 'Login with Google' : 'Logout'}</a>
                </div>
            </div>  
            
        </div>);
};


export default Menu;