import jwt, { JwtPayload } from 'jsonwebtoken';

export const signJwtAccessToken = (payload: JwtPayload) => {
	const secret_key = process.env.SECRET_KEY;
	if (!secret_key) {
		throw new Error('SECRET_KEY environment variable is not set');
	}
	const token = jwt.sign(payload, secret_key, { expiresIn: '1h' });
	return token;
};

export const verifyJwtAccessToken = async (token: string) => {
	try {
		const secret_key = process.env.SECRET_KEY;
		if (!secret_key) {
			console.error('SECRET_KEY environment variable is not set');
			return null;
		}
		const decoded = jwt.verify(token, secret_key);
		return decoded as JwtPayload;
	} catch (error) {
		console.error('JWT verification error:', error);
		return null;
	}
};

export const verifyJwt = (token: string) => {
	try {
		const secret_key = process.env.SECRET_KEY;
		const decoded = jwt.verify(token, secret_key!);
		return decoded as JwtPayload;
	} catch (error) {
		console.log(error);
		return null;
	}
};

// export const isTokenExpired = (token: string) => Date.now() >= JSON.parse(window.atob(token.split('.')[1])).exp * 1000;

export const isTokenExpired = (token: string) => {
	try {
		if (!token) return true; // Consider empty tokens as expired

		const payloadBase64 = token.split('.')[1];
		if (!payloadBase64) return true; // Invalid JWT format

		// Decode Base64 payload (works in both browser & Node.js)
		const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
		const decodedPayload =
			typeof window === 'undefined'
				? Buffer.from(base64, 'base64').toString('utf-8') // Node.js
				: atob(base64); // Browser

		const payload = JSON.parse(decodedPayload);

		return Date.now() >= payload.exp * 1000;
	} catch (error) {
		console.error('Invalid token:', error);
		return true; // Assume expired if decoding fails
	}
};
