import API from '../../api';
import type { NotificationDetail } from '../types';

export const getAlertDetail = async (id: string | number): Promise<NotificationDetail> => {
    const res = await API.get<NotificationDetail>(`/api/notifications/${id}`);
    return res.data;
};
