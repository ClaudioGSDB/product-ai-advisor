import Header from "@/components/landing/header/header";
import SearchForm from "@/components/landing/search-form/search-form";

export default function Home() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-950">
			<main className="w-full max-w-xl mx-auto">
				<Header />
				<SearchForm />
			</main>
		</div>
	);
}
