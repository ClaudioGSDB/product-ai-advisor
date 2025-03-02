// src/types/index.ts
// Re-export all types from specific type files
export * from "./product";

// Common types used across the application

export interface Question {
	question: string;
	type: "multiple_choice" | "open_ended" | "boolean";
	options?: string[];
}
