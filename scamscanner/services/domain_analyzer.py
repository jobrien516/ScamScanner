import whois
from urllib.parse import urlparse
from loguru import logger
from datetime import datetime
from fastapi.concurrency import run_in_threadpool


class DomainAnalyzer:
    async def get_domain_info(self, url: str):
        """
        Performs a WHOIS lookup asynchronously to avoid blocking the event loop.

        Args:
            url: The URL to analyze.

        Returns:
            A dictionary containing key domain information or None on failure.
        """

        def sync_whois_lookup(domain: str):
            """Wrapper for the synchronous whois call."""
            try:
                return whois.whois(domain)
            except Exception as e:
                logger.error(f"WHOIS lookup failed for {domain}: {e}")
                return None

        try:
            domain_name = urlparse(url).netloc
            if not domain_name:
                return None

            logger.info(f"Performing WHOIS lookup for {domain_name}...")
            w = await run_in_threadpool(sync_whois_lookup, domain_name)

            if not w or not w.creation_date:
                return None

            creation_date = w.creation_date
            if isinstance(creation_date, list):
                creation_date = creation_date[0]

            expiration_date = w.expiration_date
            if isinstance(expiration_date, list):
                expiration_date = expiration_date[0]

            domain_age_days = None
            if isinstance(creation_date, datetime):
                domain_age_days = (datetime.now() - creation_date).days

            return {
                "registrar": w.registrar,
                "creation_date": creation_date.isoformat()
                if isinstance(creation_date, datetime)
                else None,
                "expiration_date": expiration_date.isoformat()
                if isinstance(expiration_date, datetime)
                else None,
                "domain_age_days": domain_age_days,
            }

        except Exception as e:
            logger.error(f"An exception occurred during domain analysis for {url}: {e}")
            return None
