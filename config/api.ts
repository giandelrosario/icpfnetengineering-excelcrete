import axios from 'axios';

const getAccessToken = () => {
	if (typeof window === 'undefined') return null;

	const storedToken = sessionStorage.getItem('auth_token');
	if (!storedToken) return null;

	try {
		const parsedToken = JSON.parse(storedToken) as { token?: string };
		return parsedToken?.token || null;
	} catch {
		return null;
	}
};

const instance = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
});

instance.interceptors.request.use((request) => {
	const accessToken = getAccessToken();

	if (accessToken) {
		request.headers.Authorization = `Bearer ${accessToken}`;
	}

	return request;
});

export default instance;
