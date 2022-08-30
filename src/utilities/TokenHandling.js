import { getNewIDTokenWithRefreshToken } from './Login';

export const getParsedJWTToken = (stringifiedToken) => {
    return JSON.parse(stringifiedToken);
}

export const isTokenExpired = (issuedTime, expirationTime) => {
    return Date.now() >= (expirationTime * 1000);
}

export const refreshTokenAPICallUnauthorized = async (response) => {
    if(response.status === 401) {
        let parsedToken = getUserToken();
        return getRefreshedCredentials(parsedToken.refresh_token)
        
    }
    return response;
}


export const getRefreshedCredentials = async (refreshToken) => {
    let response = await getNewIDTokenWithRefreshToken(refreshToken);

    return response;
  }

export const getUserToken = () => {
    let token = localStorage.getItem('token');
    return getParsedJWTToken(token);
}

export const setIDTokenFromRefreshResponse = async (response) => {
    let newToken = await response.json();
    let parsedToken = getUserToken();

    parsedToken.id_token = newToken.id_token;

    let stringedToken = JSON.stringify(parsedToken);
    localStorage.setItem('token', stringedToken);
}