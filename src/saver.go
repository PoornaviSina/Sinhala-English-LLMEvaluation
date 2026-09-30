package src

import (
	"encoding/json"
	"os"
)

func SaveResults(filePath string, results []EvaluationResult) error {
	data, err := json.MarshalIndent(results, "", "  ")
	if err != nil {
		return err
	}

	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		return err
	}

	return nil
}

func LoadResults(filePath string) ([]EvaluationResult, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var results []EvaluationResult

	err = json.Unmarshal(data, &results)
	if err != nil {
		return nil, err
	}

	return results, nil
}
