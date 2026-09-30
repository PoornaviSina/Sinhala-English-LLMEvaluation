package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
)

type QualityReviewItem struct {
	ID               string `json:"id"`
	Category         string `json:"category"`
	Difficulty       string `json:"difficulty"`
	Input            string `json:"input"`
	ExpectedIntent   string `json:"expected_intent"`
	PredictedIntent  string `json:"predicted_intent"`
	ExpectedResponse string `json:"expected_response"`
	ActualResponse   string `json:"actual_response"`

	RelevanceScore   *int   `json:"relevance_score"`
	HelpfulnessScore *int   `json:"helpfulness_score"`
	LanguageScore    *int   `json:"language_score"`
	UnsupportedClaim *bool  `json:"unsupported_claim"`
	Notes            string `json:"notes"`
}

const reviewFile = "results/quality_reviews.json"

func main() {
	fmt.Println("Interactive Response Quality Evaluation")
	fmt.Println("=======================================")

	reviews, err := loadReviews(reviewFile)
	if err != nil {
		fmt.Println("Error loading quality reviews:", err)
		return
	}

	reader := bufio.NewReader(os.Stdin)

	completed := 0

	for _, review := range reviews {
		if isCompleted(review) {
			completed++
		}
	}

	fmt.Printf("Total responses: %d\n", len(reviews))
	fmt.Printf("Already reviewed: %d\n", completed)
	fmt.Printf("Remaining: %d\n\n", len(reviews)-completed)

	for i := range reviews {

		if isCompleted(reviews[i]) {
			continue
		}

		review := &reviews[i]

		fmt.Println("--------------------------------------------------")
		fmt.Printf("Test Case: %s\n", review.ID)
		fmt.Printf("Category: %s\n", review.Category)
		fmt.Printf("Difficulty: %s\n", review.Difficulty)
		fmt.Println()

		fmt.Println("Customer Input:")
		fmt.Println(review.Input)
		fmt.Println()

		fmt.Printf(
			"Expected Intent: %s\n",
			review.ExpectedIntent,
		)

		fmt.Printf(
			"Predicted Intent: %s\n",
			review.PredictedIntent,
		)

		fmt.Println()

		fmt.Println("Expected Response:")
		fmt.Println(review.ExpectedResponse)
		fmt.Println()

		fmt.Println("Actual LLM Response:")
		fmt.Println(review.ActualResponse)
		fmt.Println()

		fmt.Println("Scoring:")
		fmt.Println("2 = Good")
		fmt.Println("1 = Partial / Minor problem")
		fmt.Println("0 = Poor / Incorrect")
		fmt.Println()

		relevance, quit := readScore(
			reader,
			"Relevance score (0-2, or q to quit): ",
		)

		if quit {
			fmt.Println("\nReview stopped safely.")
			return
		}

		helpfulness, quit := readScore(
			reader,
			"Helpfulness score (0-2, or q to quit): ",
		)

		if quit {
			fmt.Println("\nReview stopped safely.")
			return
		}

		language, quit := readScore(
			reader,
			"Language score (0-2, or q to quit): ",
		)

		if quit {
			fmt.Println("\nReview stopped safely.")
			return
		}

		unsupported, quit := readYesNo(
			reader,
			"Unsupported claim? (y/n, or q to quit): ",
		)

		if quit {
			fmt.Println("\nReview stopped safely.")
			return
		}

		fmt.Print("Notes (press Enter for none): ")

		notes, err := reader.ReadString('\n')
		if err != nil {
			fmt.Println("Error reading notes:", err)
			return
		}

		notes = strings.TrimSpace(notes)

		review.RelevanceScore = intPointer(relevance)
		review.HelpfulnessScore = intPointer(helpfulness)
		review.LanguageScore = intPointer(language)
		review.UnsupportedClaim = boolPointer(unsupported)
		review.Notes = notes

		err = saveReviews(reviewFile, reviews)

		if err != nil {
			fmt.Println("Error saving review:", err)
			return
		}

		completed++

		fmt.Printf(
			"\nSaved %s successfully. Progress: %d/%d\n\n",
			review.ID,
			completed,
			len(reviews),
		)
	}

	fmt.Println("=======================================")
	fmt.Println("All response quality reviews completed!")
	fmt.Printf("Reviewed responses: %d\n", len(reviews))
	fmt.Printf("Saved to: %s\n", reviewFile)
}

func loadReviews(filePath string) ([]QualityReviewItem, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var reviews []QualityReviewItem

	err = json.Unmarshal(data, &reviews)
	if err != nil {
		return nil, err
	}

	return reviews, nil
}

func saveReviews(
	filePath string,
	reviews []QualityReviewItem,
) error {

	data, err := json.MarshalIndent(
		reviews,
		"",
		"  ",
	)

	if err != nil {
		return err
	}

	return os.WriteFile(
		filePath,
		data,
		0644,
	)
}

func isCompleted(review QualityReviewItem) bool {
	return review.RelevanceScore != nil &&
		review.HelpfulnessScore != nil &&
		review.LanguageScore != nil &&
		review.UnsupportedClaim != nil
}

func readScore(
	reader *bufio.Reader,
	message string,
) (int, bool) {

	for {
		fmt.Print(message)

		input, err := reader.ReadString('\n')
		if err != nil {
			fmt.Println("Error reading input:", err)
			continue
		}

		input = strings.TrimSpace(input)

		if strings.EqualFold(input, "q") {
			return 0, true
		}

		score, err := strconv.Atoi(input)

		if err == nil && score >= 0 && score <= 2 {
			return score, false
		}

		fmt.Println(
			"Invalid input. Please enter 0, 1, 2, or q.",
		)
	}
}

func readYesNo(
	reader *bufio.Reader,
	message string,
) (bool, bool) {

	for {
		fmt.Print(message)

		input, err := reader.ReadString('\n')
		if err != nil {
			fmt.Println("Error reading input:", err)
			continue
		}

		input = strings.ToLower(
			strings.TrimSpace(input),
		)

		switch input {
		case "y", "yes":
			return true, false

		case "n", "no":
			return false, false

		case "q":
			return false, true

		default:
			fmt.Println(
				"Invalid input. Please enter y, n, or q.",
			)
		}
	}
}

func intPointer(value int) *int {
	return &value
}

func boolPointer(value bool) *bool {
	return &value
}
