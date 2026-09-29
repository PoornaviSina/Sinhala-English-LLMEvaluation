package main

import (
	"fmt"

	"github.com/PoornaviSina/Sinhala-English-LLMEvaluation/src"
)

func main() {
	fmt.Println("Sinhala-English LLM Evaluation Framework")
	fmt.Println("----------------------------------------")

	testCases, err := src.LoadTestCases("data/test_cases.json")

	if err != nil {
		fmt.Println("Error loading test cases:", err)
		return
	}

	fmt.Printf("Successfully loaded %d test cases.\n\n", len(testCases))

	for _, testCase := range testCases {
		fmt.Println("ID:", testCase.ID)
		fmt.Println("Category:", testCase.Category)
		fmt.Println("Input:", testCase.Input)
		fmt.Println("Expected Intent:", testCase.ExpectedIntent)
		fmt.Println("Difficulty:", testCase.Difficulty)
		fmt.Println("----------------------------------------")
	}
}