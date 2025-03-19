// File: src/components/products/WalmartProducts.tsx

"use client";
import { useState, useEffect } from "react";
import { fetchTrendingProducts } from "@/services/walmart-service/walmart-service";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface Product {
	id: string;
	name: string;
	salePrice: number;
	imageUrl: string;
	productUrl: string;
	// Add other fields as needed based on the actual Walmart API response
}

export default function WalmartProducts() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadProducts() {
			try {
				setLoading(true);
				const data = await fetchTrendingProducts();

				// Adapt this based on the actual structure of the Walmart API response
				if (data.items && Array.isArray(data.items)) {
					setProducts(data.items);
				} else {
					console.warn("Unexpected API response structure:", data);
					setProducts([]);
				}

				setError(null);
			} catch (err) {
				console.error("Failed to load products:", err);
				setError("Failed to load products. Please try again later.");
				setProducts([]);
			} finally {
				setLoading(false);
			}
		}

		loadProducts();
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-40">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
				<p className="text-red-700">{error}</p>
			</div>
		);
	}

	if (!products.length) {
		return <p className="text-center py-8">No products found.</p>;
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{products.map((product) => (
				<Card key={product.id} className="flex flex-col">
					<CardHeader>
						<CardTitle className="line-clamp-2 h-14">
							{product.name}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex-grow">
						{product.imageUrl && (
							<div className="aspect-square w-full mb-4 bg-gray-100 flex items-center justify-center overflow-hidden">
								<img
									src={product.imageUrl}
									alt={product.name}
									className="max-h-full object-contain"
								/>
							</div>
						)}
						<CardDescription className="text-xl font-bold">
							${product.salePrice.toFixed(2)}
						</CardDescription>
					</CardContent>
					<CardFooter>
						<a
							href={product.productUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="w-full p-2 bg-blue-600 text-white rounded text-center hover:bg-blue-700 transition"
						>
							View on Walmart
						</a>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
