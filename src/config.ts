export const ENVIRONMENT = {
    // Set to 'LOCAL' or 'REMOTE'
    CURRENT: 'REMOTE',
    
    LOCAL: {
        BASE_URL: 'http://192.168.9.136:8000/farm-api/',
    },
    REMOTE: {
        BASE_URL: 'https://shopalali.com/farm-api/',
    }
};

export const getBaseUrl = () => {
    if (ENVIRONMENT.CURRENT === 'LOCAL') {
        return ENVIRONMENT.LOCAL.BASE_URL;
    }
    return ENVIRONMENT.REMOTE.BASE_URL;
};
