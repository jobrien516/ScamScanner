import aiohttp
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup, Tag
from loguru import logger
from sqlmodel.ext.asyncio.session import AsyncSession

from models.schemas import Site
from exceptions import WebsiteFetchError
from models.constants import DEMO_SITES
from services.db import get_db_session

class WebsiteFetcher:
    def __init__(self, url):
        self.url = url
        self.visited_urls = set()
        self.urls_to_visit = [url]
        self.domain_name = urlparse(url).netloc

    async def fetch_website_html(self):
        """Fetches the HTML content from the given URL or a demo site."""
        normalized_url = (
            str(self.url)
            .strip()
            .replace("http://", "")
            .replace("https://", "")
            .replace("www.", "")
            .rstrip("/")
        )

        if normalized_url in DEMO_SITES:
            logger.info(f"Fetching demo site: {normalized_url}")
            return DEMO_SITES[normalized_url]

        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(self.url) as response:
                    response.raise_for_status()
                    html_content = await response.text()
                    logger.info(f"Fetched HTML content from {self.url}")
                    return html_content
            except aiohttp.ClientError as e:
                logger.error(f"Error fetching {self.url}: {e}")
                raise WebsiteFetchError(
                    f"Failed to fetch HTML content from {self.url}: {e}"
                )

    async def save_to_db(self, current_url: str, html: str, db: AsyncSession | None = None):
        """Saves the fetched HTML content to the database."""
        site = Site(url=current_url, html=html)

        if db is None:
            async with get_db_session() as session:
                session.add(site)
                await session.commit()
        else:
            db.add(site)
            await db.commit()
        
        logger.info(f"Successfully saved HTML for {current_url} to database.")

    async def download_site(self):
        """
        Downloads the entire website by crawling links within the same domain
        and saves the content.
        """
        async with aiohttp.ClientSession() as session:
            while self.urls_to_visit:
                current_url = self.urls_to_visit.pop(0)

                if current_url in self.visited_urls:
                    continue

                self.visited_urls.add(current_url)
                logger.info(f"Downloading: {current_url}")

                html = await self.fetch_website_html()
                if html is None:
                    continue

                await self.save_to_db(current_url, html)

                soup = BeautifulSoup(html, "html.parser")
                for tag in soup.find_all(["a", "link", "script", "img"]):
                    if isinstance(tag, Tag):
                        attr = "href" if tag.name in ["a", "link"] else "src"
                        if tag.has_attr(attr):
                            link_url = str(tag[attr])
                            absolute_url = urljoin(current_url, link_url)
                            if (
                                urlparse(absolute_url).netloc == self.domain_name
                                and absolute_url not in self.visited_urls
                            ):
                                self.urls_to_visit.append(absolute_url)

        logger.info("\nDownload complete.")
