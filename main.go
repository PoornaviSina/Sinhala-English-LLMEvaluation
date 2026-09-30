package main

import (
	"fmt"
	"strings"

	"github.com/PoornaviSina/Sinhala-English-LLMEvaluation/src"
)

func main() {
	fmt.Println("Sinhala-English LLM Evaluation Framework")
	fmt.Println("----------------------------------------")

	// Load test cases
	testCases, err := src.LoadTestCases("data/test_cases.json")
	if err != nil {
		fmt.Println("Error loading test cases:", err)
		return
	}

	fmt.Printf("Successfully loaded %d test cases.\n\n", len(testCases))

	correctCount := 0
	incorrectCount := 0

	// Evaluate every test case
	for _, testCase := range testCases {

		fmt.Println("========================================")
		fmt.Println("Testing:", testCase.ID)
		fmt.Println("Category:", testCase.Category)
		fmt.Println("Input:", testCase.Input)

		prompt := fmt.Sprintf(`
You are a customer support assistant that understands Sinhala,
English, Singlish, and Sinhala-English code-mixed messages.

Classify the customer's message into exactly ONE of the following intent labels:

order_status
cancel_order
return_item
refund_request
payment_issue
damaged_item
wrong_item
delivery_issue
change_address
product_inquiry
account_issue
complaint

Important rules:
- Use only one of the intent labels listed above.
- Do not create a new intent label.
- order_status means the customer is asking for the current status or tracking of an order.
- delivery_issue means the customer is explicitly reporting a delivery problem or excessive delay.

Customer message:
%s

Return your answer using exactly this format:

Intent: <intent_label>
Response: <short helpful response>
`, testCase.Input)

		// Send test case to Gemini
		response, err := src.AskGemini(prompt)

		if err != nil {
			fmt.Println("API Error:", err)
			incorrectCount++
			continue
		}

		// Extract Gemini's predicted intent
		predictedIntent := extractIntent(response)

		result := "INCORRECT"

		if strings.EqualFold(
			strings.TrimSpace(testCase.ExpectedIntent),
			strings.TrimSpace(predictedIntent),
		) {
			result = "CORRECT"
			correctCount++
		} else {
			incorrectCount++
		}

		fmt.Println("Expected Intent:", testCase.ExpectedIntent)
		fmt.Println("Predicted Intent:", predictedIntent)
		fmt.Println("Result:", result)

		fmt.Println()
		fmt.Println("Gemini Response:")
		fmt.Println(response)
		fmt.Println()
	}

	// Calculate accuracy
	totalTests := len(testCases)

	accuracy := 0.0

	if totalTests > 0 {
		accuracy = (float64(correctCount) / float64(totalTests)) * 100
	}

	// Display summary
	fmt.Println("========================================")
	fmt.Println("EVALUATION SUMMARY")
	fmt.Println("========================================")
	fmt.Println("Total Tests:", totalTests)
	fmt.Println("Correct:", correctCount)
	fmt.Println("Incorrect:", incorrectCount)
	fmt.Printf("Accuracy: %.2f%%\n", accuracy)
}

// Extract the intent label from Gemini's response
func extractIntent(response string) string {
	lines := strings.Split(response, "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)

		if strings.HasPrefix(strings.ToLower(line), "intent:") {
			intent := strings.TrimSpace(line[len("Intent:"):])
			return intent
		}
	}

	return "unknown"
}