import API from "../../api";

export interface HistoryEventFilters {
    type_id?: string | number;
    start_date?: string;
    end_date?: string;
}

export interface PaginatedHistoryResponse {
    current_page: number;
    data: any[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links?: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export const getHistoryEvents = async (
    page: number = 1,
    filters: HistoryEventFilters = {}
): Promise<PaginatedHistoryResponse> => {
    try {
        const { type_id, start_date, end_date } = filters;
        const params = new URLSearchParams();
        
        if (page) params.append('page', page.toString());
        if (type_id) params.append('type_id', type_id.toString());
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);

        const response = await API.get<PaginatedHistoryResponse>(`/api/events/history?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
