package src

import (
	"encoding/json"
	"os"
)

func LoadTestCases(filePath string) ([]TestCase, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var testCases []TestCase

	err = json.Unmarshal(data, &testCases)
	if err != nil {
		return nil, err
	}

	return testCases, nil
}