"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import FollowUpQuestions from "@/components/landing/follow-up-questions/follow-up-questions";
import axios from "axios";

// Define the different states of the conversation
type ConversationState =
	| "initial" // Search form is displayed
	| "followup" // Follow-up questions are displayed
	| "results"; // Final results are displayed

// Message history
interface Message {
	role: "user" | "assistant";
	content: string;
}

export default function SearchForm() {
	const [query, setQuery] = useState("");
	const [budget, setBudget] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [conversationState, setConversationState] =
		useState<ConversationState>("initial");
	const [messages, setMessages] = useState<Message[]>([]);
	const [currentQuestion, setCurrentQuestion] = useState<string>("");
	const [currentOptions, setCurrentOptions] = useState<string[]>([]);

	// Initial submission of the product query
	const handleInitialSubmit = async () => {
		if (!query.trim()) return;

		setIsLoading(true);

		try {
			// Add user message to history
			const userMessage: Message = {
				role: "user",
				content: `I'm looking for ${query}${
					budget ? ` with a budget of $${budget}` : ""
				}`,
			};

			setMessages([...messages, userMessage]);

			// Call our API route
			const response = await axios.post("/api/gemini", {
				query,
				budget: budget ? parseFloat(budget) : null,
			});

			const aiResponse = response.data.response;

			// Add AI response to history
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: aiResponse,
				},
			]);

			// Detect if this is a question that needs a follow-up
			// This detection could be improved with AI analyzing the response
			// For now, we'll use a simple heuristic to detect questions
			const containsQuestion =
				aiResponse.includes("?") ||
				aiResponse.toLowerCase().includes("could you") ||
				aiResponse.toLowerCase().includes("what kind") ||
				aiResponse.toLowerCase().includes("tell me more");

			if (containsQuestion) {
				setCurrentQuestion(aiResponse);

				// Check if we can extract multiple choice options
				// This is a simple heuristic - in a real app, the AI could return structured data
				if (aiResponse.includes("1.") && aiResponse.includes("2.")) {
					// Extract options from numbered list (very basic implementation)
					const options = aiResponse
						.split(/\d+\./)
						.slice(1) // Skip the part before the first number
						.map((opt: string) => opt.trim())
						.filter((opt: string) => opt.length > 0);

					setCurrentOptions(options);
				} else {
					// No options detected, this will be a free text question
					setCurrentOptions([]);
				}

				setConversationState("followup");
			} else {
				// If no question, show the results
				setConversationState("results");
			}
		} catch (error) {
			console.error("Error calling API:", error);
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: "Sorry, I encountered an error. Please try again.",
				},
			]);
			setConversationState("results");
		} finally {
			setIsLoading(false);
		}
	};

	// Handle submission of a follow-up answer
	const handleFollowUpSubmit = async (answer: string) => {
		setIsLoading(true);

		try {
			// Add user's answer to message history
			const userMessage: Message = {
				role: "user",
				content: answer,
			};

			const updatedMessages = [...messages, userMessage];
			setMessages(updatedMessages);

			// Call API with the full conversation history
			const response = await axios.post("/api/gemini", {
				messages: updatedMessages,
				budget: budget ? parseFloat(budget) : null,
			});

			const aiResponse = response.data.response;

			// Add AI response to history
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: aiResponse,
				},
			]);

			// Detect if this is another question or the final results
			const containsQuestion =
				aiResponse.includes("?") ||
				aiResponse.toLowerCase().includes("could you") ||
				aiResponse.toLowerCase().includes("what kind") ||
				aiResponse.toLowerCase().includes("tell me more");

			if (containsQuestion) {
				setCurrentQuestion(aiResponse);

				// Check for multiple choice options
				if (aiResponse.includes("1.") && aiResponse.includes("2.")) {
					const options = aiResponse
						.split(/\d+\./)
						.slice(1)
						.map((opt: string) => opt.trim())
						.filter((opt: string) => opt.length > 0);

					setCurrentOptions(options);
				} else {
					setCurrentOptions([]);
				}

				setConversationState("followup");
			} else {
				// Show the final results
				setConversationState("results");
			}
		} catch (error) {
			console.error("Error calling API:", error);
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: "Sorry, I encountered an error. Please try again.",
				},
			]);
			setConversationState("results");
		} finally {
			setIsLoading(false);
		}
	};

	// Reset the conversation
	const handleReset = () => {
		setMessages([]);
		setConversationState("initial");
		setQuery("");
		setBudget("");
	};

	return (
		<>
			{/* Initial search form */}
			{conversationState === "initial" && (
				<Card className="p-5 border border-gray-200 dark:border-gray-800">
					<div className="flex flex-col gap-4">
						{/* Product query input */}
						<Input
							placeholder="What are you looking for today?"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={(e) =>
								e.key === "Enter" && handleInitialSubmit()
							}
							disabled={isLoading}
						/>

						{/* Budget input */}
						<div className="relative">
							<DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
							<Input
								type="number"
								placeholder="Budget (optional)"
								className="pl-9"
								value={budget}
								onChange={(e) => setBudget(e.target.value)}
								onKeyDown={(e) =>
									e.key === "Enter" && handleInitialSubmit()
								}
								disabled={isLoading}
							/>
						</div>

						<Button
							onClick={handleInitialSubmit}
							disabled={isLoading || !query.trim()}
							className="w-full"
						>
							{isLoading ? "Searching..." : "Find Products"}
						</Button>
					</div>
				</Card>
			)}

			{/* Follow-up questions */}
			{conversationState === "followup" && (
				<FollowUpQuestions
					question={currentQuestion}
					options={
						currentOptions.length > 0 ? currentOptions : undefined
					}
					onSubmit={handleFollowUpSubmit}
					isLoading={isLoading}
				/>
			)}

			{/* Results display */}
			{conversationState === "results" && (
				<div className="space-y-4">
					<Card className="p-5 border border-gray-200 dark:border-gray-800">
						<div className="space-y-4">
							{messages.map((message, index) => (
								<div
									key={index}
									className={`${
										message.role === "assistant"
											? "bg-gray-100 dark:bg-gray-800"
											: "bg-blue-50 dark:bg-blue-900"
									} p-3 rounded-lg`}
								>
									<div className="font-medium mb-1">
										{message.role === "assistant"
											? "AI Advisor"
											: "You"}
									</div>
									<div className="whitespace-pre-wrap">
										{message.content}
									</div>
								</div>
							))}

							<Button
								onClick={handleReset}
								variant="outline"
								className="mt-4"
							>
								Start New Search
							</Button>
						</div>
					</Card>
				</div>
			)}
		</>
	);
}
