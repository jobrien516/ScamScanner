import pytest
from unittest.mock import AsyncMock, patch
from scamscanner.services.scanners import ScamScanner, CodeScanner
from scamscanner.models.schemas import Site, AnalysisResult, AuditResult, RiskLevel


@pytest.mark.asyncio
async def test_run_analysis_with_url():
    wsman = AsyncMock()
    job_id = "test_job_id"

    async with ScamScanner(job_id, wsman) as manager:
        with (
            patch.object(
                manager, "_get_content_for_analysis", new_callable=AsyncMock
            ) as mock_get_content,
            patch.object(
                manager, "_get_domain_info", new_callable=AsyncMock
            ) as mock_get_domain,
            patch.object(
                manager, "_run_secrets_scan", new_callable=AsyncMock
            ) as mock_run_secrets,
            patch.object(
                manager, "_run_general_scan", new_callable=AsyncMock
            ) as mock_run_general,
            patch.object(
                manager, "_process_and_save_analysis", new_callable=AsyncMock
            ) as mock_process_and_save,
        ):
            mock_site = Site(id=1, url="http://example.com")
            mock_get_content.return_value = ("<html></html>", mock_site)
            mock_get_domain.return_value = {"domain_age_days": 100}
            mock_run_secrets.return_value = '{"detailedAnalysis": []}'
            mock_run_general.return_value = '{"detailedAnalysis": []}'
            mock_process_and_save.return_value = AnalysisResult(
                site_url="http://example.com",
                overallRisk=RiskLevel.LOW,
                riskScore=10,
                summary="test",
                site_id=1,
            )

            await manager.run(url="http://example.com")

            mock_get_content.assert_called_once()
            mock_get_domain.assert_called_once()
            mock_run_secrets.assert_called_once()
            mock_run_general.assert_called_once()
            mock_process_and_save.assert_called_once()
            wsman.send_final_result.assert_called_once()


@pytest.mark.asyncio
async def test_run_code_audit_with_code():
    wsman = AsyncMock()
    job_id = "test_audit_job"

    async with CodeScanner(job_id, wsman) as manager:
        with (
            patch.object(
                manager, "_get_content", new_callable=AsyncMock
            ) as mock_get_content,
            patch.object(
                manager, "_ensure_site_exists", new_callable=AsyncMock
            ) as mock_ensure_site,
            patch.object(
                manager, "_run_ai_audit", new_callable=AsyncMock
            ) as mock_run_ai_audit,
            patch.object(
                manager, "_process_and_save_audit", new_callable=AsyncMock
            ) as mock_process_and_save,
        ):
            mock_get_content.return_value = ("print('hello')", f"manual_audit_{job_id}")
            mock_ensure_site.return_value = Site(id=1, url=f"manual_audit_{job_id}")
            mock_run_ai_audit.return_value = '{"detailedAnalysis": []}'
            mock_process_and_save.return_value = AuditResult(
                source_identifier="test",
                overallGrade="A",
                qualityScore=100,
                summary="test",
                site_id=1,
            )

            await manager.run(code="print('hello')")

            mock_get_content.assert_called_once()
            mock_ensure_site.assert_called_once()
            mock_run_ai_audit.assert_called_once()
            mock_process_and_save.assert_called_once()
            wsman.send_final_result.assert_called_once()
