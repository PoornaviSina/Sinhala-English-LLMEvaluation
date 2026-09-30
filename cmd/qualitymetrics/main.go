package main

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
)

type QualityReviewItem struct {
	ID               string `json:"id"`
	Category         string `json:"category"`
	Difficulty       string `json:"difficulty"`
	RelevanceScore   *int   `json:"relevance_score"`
	HelpfulnessScore *int   `json:"helpfulness_score"`
	LanguageScore    *int   `json:"language_score"`
	UnsupportedClaim *bool  `json:"unsupported_claim"`
}

type GroupStats struct {
	Count             int
	RelevanceTotal    int
	HelpfulnessTotal  int
	LanguageTotal     int
	UnsupportedClaims int
}

const reviewFile = "results/quality_reviews.json"

func main() {
	reviews, err := loadReviews(reviewFile)
	if err != nil {
		fmt.Println("Error loading quality reviews:", err)
		return
	}

	if len(reviews) == 0 {
		fmt.Println("No quality reviews found.")
		return
	}

	incomplete := 0

	for _, review := range reviews {
		if !isComplete(review) {
			incomplete++
		}
	}

	if incomplete > 0 {
		fmt.Printf(
			"Cannot calculate final metrics: %d reviews are incomplete.\n",
			incomplete,
		)
		return
	}

	total := GroupStats{}
	categoryStats := make(map[string]*GroupStats)
	difficultyStats := make(map[string]*GroupStats)

	for _, review := range reviews {
		addReview(&total, review)

		if _, exists := categoryStats[review.Category]; !exists {
			categoryStats[review.Category] = &GroupStats{}
		}
		addReview(categoryStats[review.Category], review)

		if _, exists := difficultyStats[review.Difficulty]; !exists {
			difficultyStats[review.Difficulty] = &GroupStats{}
		}
		addReview(difficultyStats[review.Difficulty], review)
	}

	fmt.Println("=======================================")
	fmt.Println("RESPONSE QUALITY EVALUATION REPORT")
	fmt.Println("=======================================")
	fmt.Printf("Total Reviewed Responses: %d\n\n", total.Count)

	printOverall(total)

	fmt.Println()
	fmt.Println("QUALITY BY LANGUAGE CATEGORY")
	fmt.Println("---------------------------------------")
	printGroups(categoryStats)

	fmt.Println()
	fmt.Println("QUALITY BY DIFFICULTY")
	fmt.Println("---------------------------------------")
	printGroups(difficultyStats)

	fmt.Println()
	fmt.Println("=======================================")
	fmt.Println("Quality metrics calculation completed.")
}

func loadReviews(filePath string) ([]QualityReviewItem, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var reviews []QualityReviewItem

	if err := json.Unmarshal(data, &reviews); err != nil {
		return nil, err
	}

	return reviews, nil
}

func isComplete(review QualityReviewItem) bool {
	return review.RelevanceScore != nil &&
		review.HelpfulnessScore != nil &&
		review.LanguageScore != nil &&
		review.UnsupportedClaim != nil
}

func addReview(stats *GroupStats, review QualityReviewItem) {
	stats.Count++
	stats.RelevanceTotal += *review.RelevanceScore
	stats.HelpfulnessTotal += *review.HelpfulnessScore
	stats.LanguageTotal += *review.LanguageScore

	if *review.UnsupportedClaim {
		stats.UnsupportedClaims++
	}
}

func printOverall(stats GroupStats) {
	maxPerMetric := float64(stats.Count * 2)
	maxOverall := float64(stats.Count * 6)

	relevancePct := percentage(
		float64(stats.RelevanceTotal),
		maxPerMetric,
	)

	helpfulnessPct := percentage(
		float64(stats.HelpfulnessTotal),
		maxPerMetric,
	)

	languagePct := percentage(
		float64(stats.LanguageTotal),
		maxPerMetric,
	)

	totalScore := stats.RelevanceTotal +
		stats.HelpfulnessTotal +
		stats.LanguageTotal

	overallPct := percentage(
		float64(totalScore),
		maxOverall,
	)

	unsupportedPct := percentage(
		float64(stats.UnsupportedClaims),
		float64(stats.Count),
	)

	fmt.Println("OVERALL QUALITY")
	fmt.Println("---------------------------------------")

	fmt.Printf(
		"Average Relevance: %.2f / 2 (%.2f%%)\n",
		float64(stats.RelevanceTotal)/float64(stats.Count),
		relevancePct,
	)

	fmt.Printf(
		"Average Helpfulness: %.2f / 2 (%.2f%%)\n",
		float64(stats.HelpfulnessTotal)/float64(stats.Count),
		helpfulnessPct,
	)

	fmt.Printf(
		"Average Language Quality: %.2f / 2 (%.2f%%)\n",
		float64(stats.LanguageTotal)/float64(stats.Count),
		languagePct,
	)

	fmt.Printf(
		"Average Total Quality: %.2f / 6 (%.2f%%)\n",
		float64(totalScore)/float64(stats.Count),
		overallPct,
	)

	fmt.Printf(
		"Unsupported Claims: %d / %d (%.2f%%)\n",
		stats.UnsupportedClaims,
		stats.Count,
		unsupportedPct,
	)
}

func printGroups(groups map[string]*GroupStats) {
	names := make([]string, 0, len(groups))

	for name := range groups {
		names = append(names, name)
	}

	sort.Strings(names)

	for _, name := range names {
		stats := groups[name]

		totalScore := stats.RelevanceTotal +
			stats.HelpfulnessTotal +
			stats.LanguageTotal

		maxOverall := float64(stats.Count * 6)

		overallPct := percentage(
			float64(totalScore),
			maxOverall,
		)

		unsupportedPct := percentage(
			float64(stats.UnsupportedClaims),
			float64(stats.Count),
		)

		fmt.Printf("\n%s\n", name)

		fmt.Printf(
			"  Responses: %d\n",
			stats.Count,
		)

		fmt.Printf(
			"  Avg Relevance: %.2f / 2\n",
			float64(stats.RelevanceTotal)/float64(stats.Count),
		)

		fmt.Printf(
			"  Avg Helpfulness: %.2f / 2\n",
			float64(stats.HelpfulnessTotal)/float64(stats.Count),
		)

		fmt.Printf(
			"  Avg Language: %.2f / 2\n",
			float64(stats.LanguageTotal)/float64(stats.Count),
		)

		fmt.Printf(
			"  Overall Quality: %.2f%%\n",
			overallPct,
		)

		fmt.Printf(
			"  Unsupported Claims: %d/%d (%.2f%%)\n",
			stats.UnsupportedClaims,
			stats.Count,
			unsupportedPct,
		)
	}
}

func percentage(value float64, maximum float64) float64 {
	if maximum == 0 {
		return 0
	}

	return (value / maximum) * 100
}
