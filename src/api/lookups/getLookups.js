import API from '../../api';

export const getLookups = async () => {
    const res = await API.get('/api/lookups');
    return res.data;
}