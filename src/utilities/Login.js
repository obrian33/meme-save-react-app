
export const getTokens = async (accessCode) => {    
    let res = await fetch('https://memesave.auth.us-west-2.amazoncognito.com/oauth2/token', getTokenLoginFlowConfig(accessCode));
    return res;
}

const getTokenLoginFlowBody = (accessCode) => {
    return new URLSearchParams({
        'grant_type' : 'authorization_code',
        'code' : accessCode,
        'redirect_uri' : 'http://localhost:3000',
        'client_id' : '5s6nm5boso4h0p4de46idhsm20'
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
        'client_id' : '5s6nm5boso4h0p4de46idhsm20'
    });
}

export const isRedirectedLoginFlow = (locationPath) => {
    return locationPath.search && locationPath.search.indexOf('=') >= 0
}

export const retrieveAccessCodeFromLoginFlow = (locationPath) => {
    return locationPath.search.substring(locationPath.search.indexOf('=') + 1);
}

