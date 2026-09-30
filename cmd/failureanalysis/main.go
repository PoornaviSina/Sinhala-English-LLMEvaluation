package main

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
)

type QualityReview struct {
	ID               string `json:"id"`
	Category         string `json:"category"`
	Input            string `json:"input"`
	ActualResponse   string `json:"actual_response"`
	RelevanceScore   *int   `json:"relevance_score"`
	HelpfulnessScore *int   `json:"helpfulness_score"`
	LanguageScore    *int   `json:"language_score"`
	UnsupportedClaim *bool  `json:"unsupported_claim"`
	Notes            string `json:"notes"`
}

type FailurePattern struct {
	Name  string
	Count int
	IDs   []string
}

const qualityFile = "results/quality_reviews.json"

func main() {
	reviews, err := loadReviews(qualityFile)
	if err != nil {
		fmt.Println("Error loading quality reviews:", err)
		return
	}

	if len(reviews) == 0 {
		fmt.Println("No quality reviews found.")
		return
	}

	patterns := map[string]*FailurePattern{
		"Unsupported Capability Claims": {
			Name: "Unsupported Capability Claims",
		},
		"Language Appropriateness Issues": {
			Name: "Language Appropriateness Issues",
		},
		"Reduced Helpfulness": {
			Name: "Reduced Helpfulness",
		},
		"Malformed or Mixed-Script Output": {
			Name: "Malformed or Mixed-Script Output",
		},
		"Premature Product Availability Assumptions": {
			Name: "Premature Product Availability Assumptions",
		},
	}

	for _, review := range reviews {
		if review.UnsupportedClaim != nil && *review.UnsupportedClaim {
			addFailure(
				patterns["Unsupported Capability Claims"],
				review.ID,
			)
		}

		if review.LanguageScore != nil && *review.LanguageScore < 2 {
			addFailure(
				patterns["Language Appropriateness Issues"],
				review.ID,
			)
		}

		if review.HelpfulnessScore != nil && *review.HelpfulnessScore < 2 {
			addFailure(
				patterns["Reduced Helpfulness"],
				review.ID,
			)
		}

		notes := strings.ToLower(review.Notes)

		if strings.Contains(notes, "malformed") ||
			strings.Contains(notes, "mixed-script") ||
			strings.Contains(notes, "mixed script") ||
			strings.Contains(notes, "unexpected non-sinhala") ||
			strings.Contains(notes, "hindi script") {
			addFailure(
				patterns["Malformed or Mixed-Script Output"],
				review.ID,
			)
		}

		if strings.Contains(notes, "availability") &&
			(strings.Contains(notes, "yes") ||
				strings.Contains(notes, "inventory")) {
			addFailure(
				patterns["Premature Product Availability Assumptions"],
				review.ID,
			)
		}
	}

	order := []string{
		"Unsupported Capability Claims",
		"Language Appropriateness Issues",
		"Reduced Helpfulness",
		"Malformed or Mixed-Script Output",
		"Premature Product Availability Assumptions",
	}

	fmt.Println("=======================================")
	fmt.Println("LLM FAILURE PATTERN ANALYSIS")
	fmt.Println("=======================================")
	fmt.Printf("Total Reviewed Responses: %d\n\n", len(reviews))

	for _, name := range order {
		pattern := patterns[name]

		sort.Strings(pattern.IDs)

		percentage := float64(pattern.Count) /
			float64(len(reviews)) * 100

		fmt.Printf("%s\n", pattern.Name)
		fmt.Println("---------------------------------------")
		fmt.Printf("Cases: %d/%d (%.2f%%)\n",
			pattern.Count,
			len(reviews),
			percentage,
		)

		if len(pattern.IDs) > 0 {
			fmt.Printf(
				"Test Case IDs: %s\n",
				strings.Join(pattern.IDs, ", "),
			)
		} else {
			fmt.Println("Test Case IDs: None")
		}

		fmt.Println()
	}

	fmt.Println("INTERPRETATION")
	fmt.Println("---------------------------------------")
	fmt.Println(
		"Intent classification performance should be interpreted separately " +
			"from generated-response quality.",
	)
	fmt.Println(
		"A response may contain the correct intent while still showing " +
			"language, helpfulness, or reliability problems.",
	)
	fmt.Println(
		"Unsupported capability claims indicate responses that imply access " +
			"to business systems or actions that were not available in this experiment.",
	)
	fmt.Println(
		"Language appropriateness issues include responses that did not fully " +
			"match the Sinhala, Singlish, or code-mixed language context.",
	)

	fmt.Println()
	fmt.Println("=======================================")
	fmt.Println("Failure pattern analysis completed.")
}

func loadReviews(filePath string) ([]QualityReview, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var reviews []QualityReview

	if err := json.Unmarshal(data, &reviews); err != nil {
		return nil, err
	}

	return reviews, nil
}

func addFailure(pattern *FailurePattern, id string) {
	pattern.Count++
	pattern.IDs = append(pattern.IDs, id)
}
