import { NextResponse } from "next/server";
import crypto from "crypto";

const CONSUMER_ID = process.env.WALMART_CONSUMER_ID || "";
const PRIVATE_KEY = process.env.WALMART_PRIVATE_KEY || "";

const API_VERSION = process.env.WALMART_KEY_VERSION || "";
const BASE_API_URL = "https://developer.api.walmart.com";

//Generate a signature for the request
function generateWalmartSignature(): { timestamp: number; signature: string } {
	const timestamp = Math.round(Date.now());
	const message = `${CONSUMER_ID}\n${timestamp}\n${API_VERSION}\n`;

	const sign = crypto.createSign("RSA-SHA256");
	sign.update(message);
	sign.end();

	const signature = sign.sign(PRIVATE_KEY).toString("base64");

	return { timestamp, signature };
}

//fetch product data from Walmart API
async function fetchWalmartData(endpoint: string): Promise<any> {
	const { timestamp, signature } = generateWalmartSignature();

	const response = await fetch(`${BASE_API_URL}/${endpoint}`, {
		method: "GET",
		headers: {
			"WM_SEC.KEY_VERSION": API_VERSION,
			"WM_CONSUMER.ID": CONSUMER_ID,
			"WM_CONSUMER.INTIMESTAMP": timestamp.toString(),
			"WM_SEC.AUTH_SIGNATURE": signature,
		},
	});

	if (!response.ok) {
		throw new Error(`Walmart API error: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

//handle the request
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const endpoint =
			searchParams.get("endpoint") || "api-proxy/service/affil/product/v2/trends";

		const data = await fetchWalmartData(endpoint);

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching from Walmart API:", error);
		return NextResponse.json(
			{ error: "Failed to fetch data from Walmart API" },
			{ status: 500 }
		);
	}
}
