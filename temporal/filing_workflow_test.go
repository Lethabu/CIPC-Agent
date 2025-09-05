package temporal

import (
	"testing"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"go.temporal.io/sdk/testsuite"
	"go.temporal.io/sdk/workflow"
	"time"
)

// FilingWorkflowTestSuite is the test suite for the FilingWorkflow.
type FilingWorkflowTestSuite struct {
	suite.Suite
	testsuite.WorkflowTestSuite

	env *testsuite.TestWorkflowEnvironment
}

// TestFilingWorkflowTestSuite runs the test suite.
func TestFilingWorkflowTestSuite(t *testing.T) {
	suite.Run(t, new(FilingWorkflowTestSuite))
}

// SetupTest sets up the test environment before each test.
func (s *FilingWorkflowTestSuite) SetupTest() {
	s.env = s.NewTestWorkflowEnvironment()
}

// AfterTest asserts that all mocks were called as expected.
func (s *FilingWorkflowTestSuite) AfterTest(suiteName, testName string) {
	s.env.AssertExpectations(s.T())
}

// Test_FilingWorkflow_Success tests the happy path for the FilingWorkflow.
func (s *FilingWorkflowTestSuite) Test_FilingWorkflow_Success() {
	// 1. Mock the input for the workflow
	params := FilingWorkflowParams{
		UserPhone:     "+27721234567",
		CompanyRegNum: "2023/123456/07",
		ServiceType:   "annual_return",
		Documents:     []string{"http://example.com/doc1.pdf"},
	}

	// 2. Mock activities and child workflow
	s.env.OnActivity(ValidateDataActivity, mock.Anything, params).Return("Data Validated", nil).Once()
	s.env.OnChildWorkflow(ComplianceCheckWorkflow, mock.Anything, params.CompanyRegNum).Return("Compliance Check Passed", nil).Once()
	s.env.OnActivity(SubmitFilingActivity, mock.Anything, params, mock.AnythingOfType("string")).Return("Filing Submitted Successfully", nil).Once()

	// 3. Execute the workflow
	s.env.ExecuteWorkflow(FilingWorkflow, params)

	// 4. Signal the OTP after a short delay to simulate real-world scenario
	s.env.RegisterDelayedCallback(func() {
		s.env.SignalWorkflow("OTP_SIGNAL", "123456")
	}, time.Second*1)

	// 5. Assert that the workflow completed successfully and returned the correct result
	s.True(s.env.IsWorkflowCompleted())
	s.NoError(s.env.GetWorkflowError())

	var result string
	err := s.env.GetWorkflowResult(&result)
	s.NoError(err)
	s.Equal("Filing Submitted Successfully", result)
}
