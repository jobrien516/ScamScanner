import pytest
from unittest.mock import AsyncMock, patch
from scamscanner.services.scanners.secrets_scanner import SecretsScanner
from scamscanner.models.schemas import AnalysisResult, RiskLevel


@pytest.mark.asyncio
async def test_run_analysis_with_url():
    wsman = AsyncMock()
    job_id = "test_secrets_job_url"
    scanner = SecretsScanner(job_id=job_id, wsman=wsman)

    with patch(
        "scamscanner.services.secrets_scanner.get_db_session"
    ) as mock_get_db_session:
        mock_session = AsyncMock()
        mock_get_db_session.return_value.__aenter__.return_value = mock_session

        with (
            patch(
                "scamscanner.services.secrets_scanner.WebsiteFetcher"
            ) as mock_fetcher,
            patch.object(
                scanner.analyzer, "analyze_for_secrets", new_callable=AsyncMock
            ) as mock_analyze,
            patch.object(scanner.manager, "_save", new_callable=AsyncMock) as mock_save,
        ):
            mock_fetcher_instance = mock_fetcher.return_value
            mock_fetcher_instance.fetch_url_content = AsyncMock(
                return_value="some content with secrets"
            )

            mock_analyze.return_value = (
                '{"detailedAnalysis": [{"category": "Exposed Secrets"}]}'
            )
            mock_save.return_value = AnalysisResult(
                site_url="http://example.com",
                overallRisk=RiskLevel.HIGH,
                riskScore=50,
                summary="Secrets found",
                site_id=1,
            )

            await scanner.run_analysis(url="http://example.com")

            wsman.send_update.assert_any_call(
                f"Fetching content from http://example.com...", job_id
            )
            mock_fetcher_instance.fetch_url_content.assert_called_once()
            mock_analyze.assert_called_once()
            mock_save.assert_called_once()
            wsman.send_final_result.assert_called_once()
            wsman.disconnect.assert_called_once_with(job_id)


@pytest.mark.asyncio
async def test_run_analysis_with_content():
    wsman = AsyncMock()
    job_id = "test_secrets_job_content"
    scanner = SecretsScanner(job_id=job_id, wsman=wsman)

    with patch(
        "scamscanner.services.secrets_scanner.get_db_session"
    ) as mock_get_db_session:
        mock_session = AsyncMock()
        mock_get_db_session.return_value.__aenter__.return_value = mock_session

        with (
            patch.object(
                scanner.analyzer, "analyze_for_secrets", new_callable=AsyncMock
            ) as mock_analyze,
            patch.object(scanner.manager, "_save", new_callable=AsyncMock) as mock_save,
        ):
            mock_analyze.return_value = '{"detailedAnalysis": []}'
            mock_save.return_value = AnalysisResult(
                site_url=f"manual_scan_{job_id}",
                overallRisk=RiskLevel.LOW,
                riskScore=0,
                summary="No secrets",
                site_id=1,
            )

            await scanner.run_analysis(content="some safe content")

            wsman.send_update.assert_any_call("Scanning for exposed secrets...", job_id)
            mock_analyze.assert_called_once()
            mock_save.assert_called_once()
            wsman.send_final_result.assert_called_once()
            wsman.disconnect.assert_called_once_with(job_id)
