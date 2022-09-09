
export const getTokens = async (accessCode) => {    
    let res = await fetch('https://memesave.auth.us-west-2.amazoncognito.com/oauth2/token', getTokenLoginFlowConfig(accessCode));
    return res;
}

const getTokenLoginFlowBody = (accessCode) => {
    return new URLSearchParams({
        'grant_type' : 'authorization_code',
        'code' : accessCode,
        'redirect_uri' : `${ process.env.NODE_ENV === 'development' ? process.env.REACT_APP_USER_POOL_REDIRECT_DEV : process.env.REACT_APP_USER_POOL_REDIRECT_PROD }`,
        'client_id' : `${ process.env.NODE_ENV === 'development' ? process.env.REACT_APP_USER_POOL_DEV : process.env.REACT_APP_USER_POOL_PROD }`
    });
}

const getTokenLoginFlowHeaders = () => {
    return {
        'Content-Type' : 'application/x-www-form-urlencoded'
    };
}

const getTokenLoginFlowConfig = (accessCode) => {
    return {
        method : 'POST',
        mode : 'cors',
        headers : getTokenLoginFlowHeaders(),
        body : getTokenLoginFlowBody(accessCode)
    };
}

export const getNewIDTokenWithRefreshToken = async (refreshToken) => {
    let response = await fetch('https://memesave.auth.us-west-2.amazoncognito.com/oauth2/token', getRefreshTokenConfig(refreshToken));
    return response;
}

const getRefreshTokenConfig = (refreshToken) => {
    return {
        method : 'POST',
        mode : 'cors',
        headers : getRefreshTokenHeaders(),
        body : getRefreshTokenBody(refreshToken)
    };
}

const getRefreshTokenHeaders = () => {
    return getTokenLoginFlowHeaders();
}

const getRefreshTokenBody = (refreshToken) => {
    return new URLSearchParams({
        'grant_type' : 'refresh_token',
        'refresh_token' : refreshToken,
        'client_id' : `${ process.env.NODE_ENV === 'development' ? process.env.REACT_APP_USER_POOL_DEV : process.env.REACT_APP_USER_POOL_PROD }`
    });
}

export const isRedirectedLoginFlow = (locationPath) => {
    return locationPath.search && locationPath.search.indexOf('=') >= 0
}

export const retrieveAccessCodeFromLoginFlow = (locationPath) => {
    return locationPath.search.substring(locationPath.search.indexOf('=') + 1);
}

