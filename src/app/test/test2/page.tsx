// src/app/facet-test/page.tsx
"use client";
import { useState } from "react";

interface Facet {
	name: string;
	displayName: string;
	values: Array<{
		name: string;
		count: number;
		productCount?: number;
	}>;
}

export default function WalmartFacetsTest() {
	const [query, setQuery] = useState("laptops");
	const [facets, setFacets] = useState<Facet[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [rawResponse, setRawResponse] = useState<any>(null);

	const fetchFacets = async () => {
		setLoading(true);
		setError(null);

		try {
			// Use your existing API route with an endpoint query parameter
			const response = await fetch(
				`/api/walmart?endpoint=api-proxy/service/affil/product/v2/search?query=${encodeURIComponent(
					query
				)}&facet=on&facet.filter=brand:Samsung`
			);

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const data = await response.json();
			setRawResponse(data);

			if (data.facets && Array.isArray(data.facets)) {
				setFacets(data.facets);
				console.log("Facets retrieved:", data.facets);
			} else {
				setError("No facets found in the response");
				console.warn("Unexpected API response structure:", data);
			}
		} catch (err) {
			console.error("Error fetching facets:", err);
			setError(err instanceof Error ? err.message : "Unknown error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen p-8 bg-gray-50">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold mb-6">Walmart API Facets Test</h1>

				<div className="bg-white p-6 rounded-lg shadow-md mb-8">
					<div className="flex gap-4 items-end">
						<div className="flex-grow">
							<label
								htmlFor="query"
								className="block mb-2 text-sm font-medium"
							>
								Search Query
							</label>
							<input
								id="query"
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="w-full p-3 border border-gray-300 rounded-md"
								placeholder="e.g., laptops, smartphones, headphones"
							/>
						</div>
						<button
							onClick={fetchFacets}
							disabled={loading || !query}
							className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition"
						>
							{loading ? "Loading..." : "Fetch Facets"}
						</button>
					</div>
				</div>

				{error && (
					<div className="mb-8 p-4 bg-red-100 border-l-4 border-red-400 text-red-700 rounded">
						<p>
							<strong>Error:</strong> {error}
						</p>
					</div>
				)}

				{facets.length > 0 && (
					<div className="mb-8">
						<h2 className="text-2xl font-semibold mb-4">Available Facets:</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{facets.map((facet, index) => (
								<div
									key={index}
									className="bg-white shadow rounded-lg p-4"
								>
									<h3 className="font-medium text-lg mb-2">
										{facet.displayName}
									</h3>
									<p className="text-gray-500 text-sm mb-3">
										ID: {facet.name}
									</p>

									<div className="max-h-40 overflow-y-auto">
										<table className="w-full text-sm">
											<thead>
												<tr className="bg-gray-100">
													<th className="text-left p-2 rounded-tl-md">
														Value
													</th>
													<th className="text-right p-2 rounded-tr-md">
														Count
													</th>
												</tr>
											</thead>
											<tbody>
												{facet.values.map((value, vIndex) => (
													<tr
														key={vIndex}
														className="border-b border-gray-100"
													>
														<td className="p-2">
															{value.name}
														</td>
														<td className="text-right p-2">
															{value.count}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{rawResponse && (
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-2xl font-semibold mb-4">Raw API Response</h2>
						<div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[60vh]">
							<pre className="text-xs">
								{JSON.stringify(rawResponse, null, 2)}
							</pre>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
