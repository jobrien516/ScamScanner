import pytest
import json
from unittest.mock import AsyncMock, patch
from scamscanner.services.code_auditor import CodeAuditor


@pytest.fixture
def wsman():
    """Fixture to create a mock WebsocketConnectionManager."""
    return AsyncMock()


@pytest.fixture
def code_auditor(wsman):
    """Fixture to create a CodeAuditor instance with a mock wsman."""
    return CodeAuditor(job_id="test_job_id", wsman=wsman)


@pytest.mark.asyncio
async def test_run_audit_success(code_auditor, wsman):
    """
    Tests the successful execution path of the run_audit method.
    """
    code_to_analyze = "def hello():\n    return 'world'"
    mock_analysis_result = {
        "overallGrade": "A",
        "summary": "Excellent code quality.",
    }
    
    with patch('scamscanner.services.code_auditor.get_db_session') as mock_get_db_session, \
         patch('scamscanner.services.code_auditor.generate_analysis', new_callable=AsyncMock) as mock_generate_analysis:

        mock_db_session = AsyncMock()
        mock_get_db_session.return_value.__aenter__.return_value = mock_db_session
        mock_generate_analysis.return_value = json.dumps(mock_analysis_result)

        await code_auditor.run_audit(code_to_analyze)

        wsman.send_update.assert_called_with("Analyzing source code...", "test_job_id")
        mock_generate_analysis.assert_called_once()
        wsman.send_final_result.assert_called_with(mock_analysis_result, "test_job_id")
        wsman.disconnect.assert_called_once_with("test_job_id")


@pytest.mark.asyncio
async def test_run_audit_exception_handling(code_auditor, wsman):
    """
    Tests that exceptions during the audit process are caught and handled correctly.
    """
    error_message = "AI model failed"
    
    with patch('scamscanner.services.code_auditor.get_db_session') as mock_get_db_session, \
         patch('scamscanner.services.code_auditor.generate_analysis', new_callable=AsyncMock) as mock_generate_analysis:

        mock_db_session = AsyncMock()
        mock_get_db_session.return_value.__aenter__.return_value = mock_db_session
        mock_generate_analysis.side_effect = Exception(error_message)

        await code_auditor.run_audit("some code")

        wsman.send_update.assert_any_call("Analyzing source code...", "test_job_id")
        wsman.send_update.assert_any_call(f"An error occurred during analysis: {error_message}", "test_job_id")
        wsman.send_final_result.assert_not_called()
        wsman.disconnect.assert_called_once_with("test_job_id")