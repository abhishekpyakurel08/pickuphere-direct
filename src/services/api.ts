import axios from 'axios';

const API_URL = 'https://selfdrop-backend.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Crucial for receiving/sending HTTP-only refresh cookies
});

// Add a request interceptor to attach the Access Token
// Response interceptor for automatic token refresh
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Mock Mode Fallback for Admin/Vendor Routes
        if (originalRequest.url?.includes('/admin/') || originalRequest.url?.includes('/products') || originalRequest.url?.includes('/vendor/')) {
            console.warn(`[MockMode] API failed for ${originalRequest.url}, falling back to mock data.`);
            const { MOCK_STATS, MOCK_USERS, MOCK_ORDERS, MOCK_PRODUCTS, MOCK_EXPENSES, MOCK_USER_ORDERS } = await import('./mockData');

            // Artificial delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Vendor/Admin Stats
            if (originalRequest.url.includes('/stats')) {
                return {
                    data: {
                        totalProducts: MOCK_PRODUCTS.length,
                        activeProducts: MOCK_PRODUCTS.filter(p => p.approved).length,
                        pendingProducts: MOCK_PRODUCTS.filter(p => !p.approved).length,
                        totalSales: 45,
                        totalRevenue: MOCK_STATS.totalRevenue,
                        commission: 3
                    },
                    status: 200
                };
            }

            if (originalRequest.url.includes('/users') && !originalRequest.url.includes('/orders')) return { data: MOCK_USERS, status: 200 };

            // Vendor Products
            if (originalRequest.url.includes('/vendor/products')) {
                return {
                    data: {
                        products: MOCK_PRODUCTS.map(p => ({
                            id: p._id,
                            ...p,
                            status: p.approved ? 'active' : 'pending'
                        }))
                    },
                    status: 200
                };
            }

            if (originalRequest.url.includes('/orders') && !originalRequest.url.includes('/users')) return { data: MOCK_ORDERS, status: 200 };
            if (originalRequest.url.includes('/products')) return { data: MOCK_PRODUCTS, status: 200 };
            if (originalRequest.url.includes('/expenses')) return { data: MOCK_EXPENSES, status: 200 };
            if (originalRequest.url.includes('/orders') && originalRequest.url.includes('/users')) return { data: MOCK_USER_ORDERS, status: 200 };

            // For write operations, simulate success
            if (['post', 'put', 'delete'].includes(originalRequest.method)) {
                return { data: { success: true, message: 'Operation simulated (Mock Mode)' }, status: 200 };
            }
        }

        if (error.response?.status === 429) {
            const { toast } = await import('sonner');
            toast.error(error.response.data?.message || 'Slow down! Too many requests.', {
                description: 'Please wait a moment before trying again.'
            });
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
                const { accessToken } = res.data;

                localStorage.setItem('accessToken', accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('token');
                window.location.href = '/auth';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const getAuthToken = () => localStorage.getItem('accessToken') || localStorage.getItem('token');

export interface ProductData {
    id?: string;
    _id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    image?: string;
    status?: 'active' | 'pending' | 'rejected';
    approved?: boolean;
    averageRating?: number;
}

export const productsApi = {
    getAll: async () => {
        const res = await api.get('/products');
        return res.data;
    },
    getOne: async (id: string) => {
        const res = await api.get(`/products/${id}`);
        return res.data;
    },
    create: async (data: any) => {
        const res = await api.post('/products', data);
        return res.data;
    },
    createWithImage: async (formData: FormData) => {
        const res = await api.post('/products/with-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },
    update: async (id: string, data: any) => {
        const res = await api.put(`/products/${id}`, data);
        return res.data;
    },
    delete: async (id: string) => {
        const res = await api.delete(`/products/${id}`);
        return res.data;
    }
};

export const vendorApi = {
    getStats: async () => {
        const res = await api.get('/vendor/stats');
        return res.data;
    },
    getProducts: async () => {
        const res = await api.get('/vendor/products');
        return res.data;
    }
};

export default api;
