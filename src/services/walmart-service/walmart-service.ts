//service for fetching product data from walmart api

export async function fetchTrendingProducts() {
	try {
		const response = await fetch("/api/walmart");

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching trending products:", error);
		throw error;
	}
}
