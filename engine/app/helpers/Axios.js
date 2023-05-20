import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const GLOBAL = require('../../config/Global');

const fetchClient = () => {
    const defaultOptions = {
        baseURL: GLOBAL.API_URL,
        /*headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },*/
    };

    // Create instance
    let instance = axios.create(defaultOptions);

    // Set the AUTH token for any request
    instance.interceptors.request.use(
        async (config) => {
            const token = await AsyncStorage.getItem('access_token');
            config.headers.Authorization =  token ? `Bearer ${token}` : '';
            return config;
        },function (error) {
            return Promise.reject(error);
        }
    );

    return instance;
};

export default fetchClient();
