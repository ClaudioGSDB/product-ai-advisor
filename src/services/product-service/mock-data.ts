// src/services/product-service/mock-data.ts
import { Product } from "@/types/product";

// Generate a UUID for mock product IDs
const generateId = (): string => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

// Generate realistic Amazon URLs
const generateAmazonUrl = (title: string, id: string): string => {
	const slug = title
		.toLowerCase()
		.replace(/[^a-z0-9 ]/g, "")
		.replace(/\s+/g, "-");
	return `https://www.amazon.com/${slug}/dp/${id}/ref=sr_1_1`;
};

// Laptop/Computer mock products
export const laptops: Product[] = [
	{
		id: generateId(),
		title: "XPS Ultra Gaming Laptop - 16GB RAM, RTX 3070, 1TB SSD",
		description:
			"Experience ultimate gaming performance with this powerful gaming laptop featuring NVIDIA GeForce RTX 3070 graphics, 16GB RAM, and a blazing-fast 1TB NVMe SSD. The 15.6-inch 144Hz display delivers smooth gameplay and vivid visuals.",
		price: 1299.99,
		originalPrice: 1499.99,
		rating: 4.7,
		reviewCount: 852,
		image: "/api/placeholder/400/300",
		url: generateAmazonUrl("XPS Ultra Gaming Laptop", "B09DP8X5F7"),
		features: [
			"NVIDIA GeForce RTX 3070 8GB Graphics",
			"Intel Core i7-12700H Processor (14 cores, up to 4.7GHz)",
			"16GB DDR5 RAM",
			"1TB NVMe SSD",
			"15.6-inch Full HD 144Hz Display",
			"RGB Backlit Keyboard",
			"Windows 11 Home",
		],
		specifications: {
			Processor: "Intel Core i7-12700H",
			RAM: "16GB DDR5",
			Storage: "1TB NVMe SSD",
			Graphics: "NVIDIA GeForce RTX 3070",
			Display: "15.6-inch Full HD 144Hz",
			"Operating System": "Windows 11 Home",
			"Battery Life": "Up to 6 hours",
			Weight: "5.07 lbs",
		},
		category: "Computers",
		subcategory: "Gaming Laptops",
		brand: "XPS",
		availabilityStatus: "In Stock",
		prime: true,
		amazonChoice: true,
	},
	{
		id: generateId(),
		title: "ProBook Business Laptop - Intel i5, 8GB RAM, 512GB SSD",
		description:
			"Stay productive with this reliable business laptop featuring an Intel Core i5 processor, 8GB RAM, and 512GB SSD. Perfect for professional use with its crystal-clear display and all-day battery life.",
		price: 749.99,
		originalPrice: 849.99,
		rating: 4.5,
		reviewCount: 1243,
		image: "/api/placeholder/400/300",
		url: generateAmazonUrl("ProBook Business Laptop", "B08LZ9JCHF"),
		features: [
			"Intel Core i5-1135G7 Processor",
			"8GB DDR4 RAM",
			"512GB PCIe NVMe SSD",
			"14-inch Full HD IPS Display",
			"Integrated Intel Iris Xe Graphics",
			"Windows 11 Pro",
			"Fingerprint Reader",
		],
		specifications: {
			Processor: "Intel Core i5-1135G7",
			RAM: "8GB DDR4",
			Storage: "512GB PCIe NVMe SSD",
			Graphics: "Intel Iris Xe Graphics",
			Display: "14-inch Full HD IPS",
			"Operating System": "Windows 11 Pro",
			"Battery Life": "Up to 10 hours",
			Weight: "3.11 lbs",
		},
		category: "Computers",
		subcategory: "Business Laptops",
		brand: "ProBook",
		availabilityStatus: "In Stock",
		prime: true,
	},
	{
		id: generateId(),
		title: "MacBook Air M2 - 8GB RAM, 256GB SSD",
		description:
			"Experience incredible performance with the M2 chip in the redesigned MacBook Air. Features a stunning Liquid Retina display, 8GB RAM, and 256GB SSD storage in an ultra-thin, fanless design.",
		price: 1099.99,
		originalPrice: 1199.99,
		rating: 4.8,
		reviewCount: 3567,
		image: "/api/placeholder/400/300",
		url: generateAmazonUrl("MacBook Air M2", "B0B3C5HMZ8"),
		features: [
			"Apple M2 Chip with 8-core CPU and 8-core GPU",
			"8GB Unified Memory",
			"256GB SSD Storage",
			"13.6-inch Liquid Retina Display",
			"Two Thunderbolt Ports",
			"macOS Monterey",
			"Up to 18 hours of battery life",
		],
		specifications: {
			Processor: "Apple M2 Chip",
			RAM: "8GB Unified Memory",
			Storage: "256GB SSD",
			Graphics: "8-core GPU",
			Display: "13.6-inch Liquid Retina",
			"Operating System": "macOS",
			"Battery Life": "Up to 18 hours",
			Weight: "2.7 lbs",
		},
		category: "Computers",
		subcategory: "MacBooks",
		brand: "Apple",
		availabilityStatus: "In Stock",
		prime: true,
		bestSeller: true,
	},
	// More laptop options...
	{
		id: generateId(),
		title: "Budget Student Chromebook - Intel Celeron, 4GB RAM, 64GB eMMC",
		description:
			"Perfect for students and everyday tasks, this affordable Chromebook offers reliable performance with its Intel Celeron processor, 4GB RAM, and 64GB eMMC storage. Access all your favorite Google apps with Chrome OS.",
		price: 249.99,
		originalPrice: 299.99,
		rating: 4.2,
		reviewCount: 2156,
		image: "/api/placeholder/400/300",
		url: generateAmazonUrl("Budget Student Chromebook", "B09QRNJ48C"),
		features: [
			"Intel Celeron N4020 Processor",
			"4GB LPDDR4 RAM",
			"64GB eMMC Storage",
			"11.6-inch HD Display",
			"Chrome OS",
			"Up to 12 hours of battery life",
			"Lightweight design at 2.2 lbs",
		],
		specifications: {
			Processor: "Intel Celeron N4020",
			RAM: "4GB LPDDR4",
			Storage: "64GB eMMC",
			Graphics: "Intel UHD Graphics 600",
			Display: "11.6-inch HD",
			"Operating System": "Chrome OS",
			"Battery Life": "Up to 12 hours",
			Weight: "2.2 lbs",
		},
		category: "Computers",
		subcategory: "Chromebooks",
		brand: "Acer",
		availabilityStatus: "In Stock",
		prime: true,
	},
];

// Smartphone mock products
export const smartphones: Product[] = [
	{
		id: generateId(),
		title: "Galaxy S23 Ultra - 256GB, 12GB RAM, 108MP Camera",
		description:
			"Experience the ultimate smartphone with the Galaxy S23 Ultra featuring a professional-grade camera system, S Pen support, and powerful performance with the latest processor and 12GB RAM.",
		price: 1199.99,
		originalPrice: 1299.99,
		rating: 4.7,
		reviewCount: 2453,
		image: "/api/placeholder/400/300",
		url: generateAmazonUrl("Galaxy S23 Ultra", "B0BLP45GY8"),
		features: [
			"108MP Wide Camera, 12MP Ultrawide, 10MP 3x Telephoto, 10MP 10x Telephoto",
			"6.8-inch Dynamic AMOLED 2X Display with 120Hz",
			"Snapdragon 8 Gen 2 Processor",
			"12GB RAM, 256GB Storage",
			"5000mAh Battery",
			"S Pen Support",
			"Android 13 with One UI 5.1",
		],
		specifications: {
			Display: "6.8-inch Dynamic AMOLED 2X, 120Hz",
			Processor: "Snapdragon 8 Gen 2",
			RAM: "12GB",
			Storage: "256GB",
			"Rear Camera": "108MP + 12MP + 10MP + 10MP",
			"Front Camera": "40MP",
			Battery: "5000mAh",
			"Operating System": "Android 13",
		},
		category: "Electronics",
		subcategory: "Smartphones",
		brand: "Samsung",
		availabilityStatus: "In Stock",
		prime: true,
		amazonChoice: true,
	},
	{
		id: generateId(),
		title: "iPhone 14 Pro - 128GB, A16 Bionic",
		description:
			"The ultimate iPhone with Dynamic Island, a 48MP Main camera, Always-On display, and A16 Bionic, the fastest chip ever in a smartphone.",
		price: 999.99,
		originalPrice: 999.99,
		rating: 4.8,
		reviewCount: 5432,
		image: "/api/placeholder/400/300",
		url: generateAmazonUrl("iPhone 14 Pro", "B0BDJH3V3X"),
		features: [
			"6.1-inch Super Retina XDR display with Always-On and ProMotion",
			"Dynamic Island, a magical new way to interact with iPhone",
			"48MP Main camera for up to 4x resolution",
			"Cinematic mode now in 4K Dolby Vision up to 30 fps",
			"A16 Bionic, the ultimate smartphone chip",
			"All-day battery life and up to 23 hours of video playback",
		],
		specifications: {
			Display: "6.1-inch Super Retina XDR, ProMotion",
			Processor: "A16 Bionic",
			Storage: "128GB",
			"Rear Camera": "48MP + 12MP + 12MP",
			"Front Camera": "12MP TrueDepth",
			Battery: "Up to 23 hours video playback",
			"Operating System": "iOS 16",
		},
		category: "Electronics",
		subcategory: "Smartphones",
		brand: "Apple",
		availabilityStatus: "In Stock",
		prime: true,
		bestSeller: true,
	},
	// More smartphone options...
	{
		id: generateId(),
		title: "Budget Android Phone - 128GB, 48MP Camera",
		description:
			"Get amazing value with this budget-friendly Android phone featuring a 48MP camera, large battery, and plenty of storage for all your needs.",
		price: 299.99,
		originalPrice: 349.99,
		rating: 4.3,
		reviewCount: 3241,
		image: "/api/placeholder/400/300",
		url: generateAmazonUrl("Budget Android Phone", "B09SVVDQ8G"),
		features: [
			"6.5-inch LCD Display",
			"48MP Main Camera, 8MP Ultrawide, 2MP Macro",
			"MediaTek Helio G85 Processor",
			"4GB RAM, 128GB Storage (Expandable)",
			"5000mAh Battery with 18W Fast Charging",
			"Android 12",
			"Side-mounted Fingerprint Sensor",
		],
		specifications: {
			Display: "6.5-inch LCD",
			Processor: "MediaTek Helio G85",
			RAM: "4GB",
			Storage: "128GB (Expandable)",
			"Rear Camera": "48MP + 8MP + 2MP",
			"Front Camera": "13MP",
			Battery: "5000mAh",
			"Operating System": "Android 12",
		},
		category: "Electronics",
		subcategory: "Smartphones",
		brand: "Motorola",
		availabilityStatus: "In Stock",
		prime: true,
	},
];

// Smart Home mock products
export const smartHome: Product[] = [
	{
		id: generateId(),
		title: "Smart Speaker with Voice Assistant",
		description:
			"Control your smart home, play music, get answers to questions, and more with this versatile smart speaker featuring advanced voice recognition technology.",
		price: 99.99,
		originalPrice: 129.99,
		rating: 4.6,
		reviewCount: 7821,
		image: "/api/placeholder/400/300",
		url: generateAmazonUrl(
			"Smart Speaker with Voice Assistant",
			"B07XJ8C8F5"
		),
		features: [
			"Built-in voice assistant",
			"Room-filling sound with powerful bass",
			"Control compatible smart home devices",
			"Multi-room audio capability",
			"Privacy controls with microphone off button",
			"Stream music from popular services",
		],
		specifications: {
			Connectivity: "WiFi, Bluetooth",
			Dimensions: '5.7" x 5.7" x 4.7"',
			Power: "AC power",
			Speaker: '3" woofer, dual 0.8" tweeters',
			Microphones: "Far-field array with noise reduction",
			Compatibility: "Works with most smart home platforms",
		},
		category: "Smart Home",
		subcategory: "Smart Speakers",
		brand: "Echo",
		availabilityStatus: "In Stock",
		prime: true,
		amazonChoice: true,
	},
	// More smart home products...
	{
		id: generateId(),
		title: "Smart Thermostat with Energy Saving Features",
		description:
			"Save on energy bills while keeping your home comfortable with this intelligent thermostat that learns your schedule and preferences.",
		price: 249.99,
		originalPrice: 279.99,
		rating: 4.7,
		reviewCount: 5291,
		image: "/api/placeholder/400/300",
		url: generateAmazonUrl("Smart Thermostat", "B0BT1C8NNP"),
		features: [
			"Learns your temperature preferences",
			"Auto-schedule feature creates a personalized schedule",
			"Energy History shows how much energy you've used",
			"Remote control through smartphone app",
			"Works with multiple voice assistants",
			"Easy installation",
		],
		specifications: {
			Connectivity: "WiFi, Bluetooth",
			Compatibility: "Works with most HVAC systems",
			Power: "Hardwired or battery-powered",
			Display: '2.1" color LCD',
			Sensors: "Temperature, humidity, occupancy, proximity",
			"Voice Control": "Compatible with multiple platforms",
		},
		category: "Smart Home",
		subcategory: "Climate Control",
		brand: "Nest",
		availabilityStatus: "In Stock",
		prime: true,
	},
];

// Coffee makers mock products
export const coffeemakers: Product[] = [
	{
		id: generateId(),
		title: "Premium Espresso Machine with Milk Frother",
		description:
			"Create cafe-quality espresso drinks at home with this premium machine featuring a built-in grinder, 15-bar pressure system, and automatic milk frother.",
		price: 649.99,
		originalPrice: 799.99,
		rating: 4.6,
		reviewCount: 3241,
		image: "/api/placeholder/400/300",
		url: generateAmazonUrl("Premium Espresso Machine", "B07CZS6HYL"),
		features: [
			"Built-in conical burr grinder with 13 settings",
			"15-bar Italian pump delivers optimal pressure",
			"PID temperature control for precise extraction",
			"Automatic milk frothing system",
			"Digital display with programmable settings",
			"Quick heat-up time of 3 seconds",
		],
		specifications: {
			"Water Tank": "2.0L removable",
			"Bean Hopper": "0.5lb capacity",
			"Milk Frother": "Automatic with temperature control",
			Power: "1600W",
			Pressure: "15-bar",
			Dimensions: '13.0" x 12.5" x 16.0"',
			Materials: "Stainless steel body",
		},
		category: "Home & Kitchen",
		subcategory: "Coffee Machines",
		brand: "Breville",
		availabilityStatus: "In Stock",
		prime: true,
		bestSeller: true,
	},
	{
		id: generateId(),
		title: "Drip Coffee Maker with Thermal Carafe, 10-cup",
		description:
			"Brew perfect coffee every time with this programmable drip coffee maker featuring a double-walled thermal carafe that keeps coffee hot for hours without burning.",
		price: 149.99,
		originalPrice: 179.99,
		rating: 4.5,
		reviewCount: 4682,
		image: "/api/placeholder/400/300",
		url: generateAmazonUrl(
			"Drip Coffee Maker Thermal Carafe",
			"B096LMGYR9"
		),
		features: [
			"10-cup thermal carafe keeps coffee hot for hours",
			"Programmable 24-hour timer",
			"Adjustable brew strength control",
			"Shower head design for even extraction",
			"Auto-pause feature to grab a cup mid-brew",
			"Gold-tone permanent filter included",
		],
		specifications: {
			Capacity: "10 cups",
			Carafe: "Double-walled stainless steel thermal",
			"Filter Type": "Gold-tone permanent (paper compatible)",
			Program: "24-hour",
			Power: "1000W",
			Dimensions: '9.0" x 7.75" x 14.0"',
			Materials: "Stainless steel and BPA-free plastic",
		},
		category: "Home & Kitchen",
		subcategory: "Coffee Machines",
		brand: "OXO",
		availabilityStatus: "In Stock",
		prime: true,
		amazonChoice: true,
	},
	{
		id: generateId(),
		title: "Single Serve K-Cup Coffee Maker",
		description:
			"Enjoy quick, convenient coffee with this compact K-cup compatible coffee maker. Perfect for small spaces or personal use with multiple brew size options.",
		price: 79.99,
		originalPrice: 99.99,
		rating: 4.3,
		reviewCount: 9824,
		image: "/api/placeholder/400/300",
		url: generateAmazonUrl("Single Serve K-Cup Coffee Maker", "B07FK9TR6V"),
		features: [
			"Compatible with K-Cup pods or ground coffee with included adapter",
			"Multiple brew sizes: 6, 8, 10, or 12 oz",
			"One-minute brew time",
			"Removable 52 oz water reservoir",
			"Energy-saving auto shut-off",
			"Slim design fits limited counter space",
		],
		specifications: {
			Capacity: "Single serve, multiple cup sizes",
			Compatibility: "K-Cup pods or ground coffee",
			"Water Reservoir": "52 oz removable",
			"Brew Time": "Under 1 minute",
			Power: "1200W",
			Dimensions: '5.7" x 10.9" x 12.5"',
			Materials: "Plastic construction",
		},
		category: "Home & Kitchen",
		subcategory: "Coffee Machines",
		brand: "Keurig",
		availabilityStatus: "In Stock",
		prime: true,
	},
];

// Combine all mock products into one database
export const mockProductDatabase: Product[] = [
	...laptops,
	...smartphones,
	...smartHome,
	...coffeemakers,
	// Add more product categories as needed
];

// Export product categories for easy access
export const productCategories = {
	laptops,
	smartphones,
	smartHome,
	coffeemakers,
};
