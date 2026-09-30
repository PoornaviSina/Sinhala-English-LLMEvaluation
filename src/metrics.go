package src

import (
	"fmt"
	"sort"
)

type ClassMetrics struct {
	Intent    string
	TP        int
	FP        int
	FN        int
	Precision float64
	Recall    float64
	F1        float64
}

type GroupMetrics struct {
	Name     string
	Total    int
	Correct  int
	Accuracy float64
}

type OverallMetrics struct {
	Total             int
	Correct           int
	Accuracy          float64
	MacroPrecision    float64
	MacroRecall       float64
	MacroF1           float64
	ClassMetrics      []ClassMetrics
	CategoryMetrics   []GroupMetrics
	DifficultyMetrics []GroupMetrics
}

func CalculateMetrics(results []EvaluationResult) OverallMetrics {
	var metrics OverallMetrics

	metrics.Total = len(results)

	intents := getUniqueIntents(results)

	for _, result := range results {
		if result.Correct {
			metrics.Correct++
		}
	}

	if metrics.Total > 0 {
		metrics.Accuracy =
			float64(metrics.Correct) /
				float64(metrics.Total)
	}

	var totalPrecision float64
	var totalRecall float64
	var totalF1 float64

	for _, intent := range intents {
		tp := 0
		fp := 0
		fn := 0

		for _, result := range results {

			if result.ExpectedIntent == intent &&
				result.PredictedIntent == intent {
				tp++
			}

			if result.ExpectedIntent != intent &&
				result.PredictedIntent == intent {
				fp++
			}

			if result.ExpectedIntent == intent &&
				result.PredictedIntent != intent {
				fn++
			}
		}

		precision := 0.0
		recall := 0.0
		f1 := 0.0

		if tp+fp > 0 {
			precision =
				float64(tp) /
					float64(tp+fp)
		}

		if tp+fn > 0 {
			recall =
				float64(tp) /
					float64(tp+fn)
		}

		if precision+recall > 0 {
			f1 =
				2 * precision * recall /
					(precision + recall)
		}

		classMetric := ClassMetrics{
			Intent:    intent,
			TP:        tp,
			FP:        fp,
			FN:        fn,
			Precision: precision,
			Recall:    recall,
			F1:        f1,
		}

		metrics.ClassMetrics =
			append(metrics.ClassMetrics, classMetric)

		totalPrecision += precision
		totalRecall += recall
		totalF1 += f1
	}

	if len(intents) > 0 {
		metrics.MacroPrecision =
			totalPrecision / float64(len(intents))

		metrics.MacroRecall =
			totalRecall / float64(len(intents))

		metrics.MacroF1 =
			totalF1 / float64(len(intents))
	}

	metrics.CategoryMetrics =
		calculateGroupMetrics(
			results,
			func(result EvaluationResult) string {
				return result.Category
			},
		)

	metrics.DifficultyMetrics =
		calculateGroupMetrics(
			results,
			func(result EvaluationResult) string {
				return result.Difficulty
			},
		)

	return metrics
}

func getUniqueIntents(
	results []EvaluationResult,
) []string {

	intentMap := make(map[string]bool)

	for _, result := range results {
		intentMap[result.ExpectedIntent] = true
	}

	var intents []string

	for intent := range intentMap {
		intents = append(intents, intent)
	}

	sort.Strings(intents)

	return intents
}

func calculateGroupMetrics(
	results []EvaluationResult,
	groupFunction func(EvaluationResult) string,
) []GroupMetrics {

	totalCounts := make(map[string]int)
	correctCounts := make(map[string]int)

	for _, result := range results {

		group := groupFunction(result)

		totalCounts[group]++

		if result.Correct {
			correctCounts[group]++
		}
	}

	var groups []string

	for group := range totalCounts {
		groups = append(groups, group)
	}

	sort.Strings(groups)

	var groupMetrics []GroupMetrics

	for _, group := range groups {

		total := totalCounts[group]
		correct := correctCounts[group]

		accuracy := 0.0

		if total > 0 {
			accuracy =
				float64(correct) /
					float64(total)
		}

		groupMetrics = append(
			groupMetrics,
			GroupMetrics{
				Name:     group,
				Total:    total,
				Correct:  correct,
				Accuracy: accuracy,
			},
		)
	}

	return groupMetrics
}

func PrintMetrics(metrics OverallMetrics) {

	fmt.Println()
	fmt.Println("========================================")
	fmt.Println("QUANTITATIVE EVALUATION METRICS")
	fmt.Println("========================================")

	fmt.Printf(
		"Overall Accuracy: %.2f%%\n",
		metrics.Accuracy*100,
	)

	fmt.Printf(
		"Macro Precision: %.4f\n",
		metrics.MacroPrecision,
	)

	fmt.Printf(
		"Macro Recall: %.4f\n",
		metrics.MacroRecall,
	)

	fmt.Printf(
		"Macro F1 Score: %.4f\n",
		metrics.MacroF1,
	)

	fmt.Println()
	fmt.Println("PER-INTENT METRICS")
	fmt.Println("----------------------------------------")

	fmt.Printf(
		"%-20s %-4s %-4s %-4s %-10s %-10s %-10s\n",
		"Intent",
		"TP",
		"FP",
		"FN",
		"Precision",
		"Recall",
		"F1",
	)

	for _, metric := range metrics.ClassMetrics {

		fmt.Printf(
			"%-20s %-4d %-4d %-4d %-10.4f %-10.4f %-10.4f\n",
			metric.Intent,
			metric.TP,
			metric.FP,
			metric.FN,
			metric.Precision,
			metric.Recall,
			metric.F1,
		)
	}

	fmt.Println()
	fmt.Println("PERFORMANCE BY LANGUAGE CATEGORY")
	fmt.Println("----------------------------------------")

	for _, group := range metrics.CategoryMetrics {

		fmt.Printf(
			"%-15s %2d/%2d  %.2f%%\n",
			group.Name,
			group.Correct,
			group.Total,
			group.Accuracy*100,
		)
	}

	fmt.Println()
	fmt.Println("PERFORMANCE BY DIFFICULTY")
	fmt.Println("----------------------------------------")

	for _, group := range metrics.DifficultyMetrics {

		fmt.Printf(
			"%-15s %2d/%2d  %.2f%%\n",
			group.Name,
			group.Correct,
			group.Total,
			group.Accuracy*100,
		)
	}
}
