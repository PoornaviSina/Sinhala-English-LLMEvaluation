package main

import (
	"fmt"

	"github.com/PoornaviSina/Sinhala-English-LLMEvaluation/src"
)

func main() {
	fmt.Println("Sinhala-English LLM Evaluation Metrics")
	fmt.Println("======================================")

	results, err := src.LoadResults(
		"results/evaluation_results_final.json",
	)

	if err != nil {
		fmt.Println("Error loading final results:", err)
		return
	}

	fmt.Printf(
		"Loaded %d final evaluation results.\n",
		len(results),
	)

	metrics := src.CalculateMetrics(results)

	src.PrintMetrics(metrics)
}
