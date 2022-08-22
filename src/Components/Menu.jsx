const MenuItem = ({item}) => {
    return (<div className='h-8 text-sm m-4 text-lime-50'>
        {item.title}
    </div>);
};

const Menu = () => {
    let menuItems = [
        {
            title : 'Search',
            link : '',
        }, 
        {
            title : 'Meme Collection',
            link : '',
        }, 
        {
            title : 'Add Meme',
            link : '',
        }, 
        {
            title : 'Login with Google',
            link : '',
        }
    ];

    return (<div className="bg-lime-800">
            { menuItems.map((x,idx) => <MenuItem key={idx} item={x}></MenuItem>)}
        </div>);
};


export default Menu;