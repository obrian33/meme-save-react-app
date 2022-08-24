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
    return !signedIn ? 'https://memesave.auth.us-west-2.amazoncognito.com/login?response_type=token&client_id=2si0r1d1pfqai8t91fl1hpd62i&redirect_uri=http://localhost:3000' 
    : 'https://memesave.auth.us-west-2.amazoncognito.com/logout?client_id=2si0r1d1pfqai8t91fl1hpd62i&logout_uri=http://localhost:3000';
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
                    <a onClick={() => {localStorage.removeItem('token'); setSignedIn(false); }} href={getLoginUrls(signedIn)}>{!signedIn ? 'Login with Google' : 'Logout'}</a>
                </div>
            </div>  
            
        </div>);
};


export default Menu;