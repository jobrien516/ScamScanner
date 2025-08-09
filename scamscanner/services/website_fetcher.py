import aiohttp
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup, Tag
from loguru import logger
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from ..models.schemas import Site, SubPage
from ..exceptions import WebsiteFetchError
from ..models.constants import DEMO_SITES
from .db import get_db_session


class WebsiteFetcher:
    def __init__(self, url):
        self.url = url
        self.visited_urls = set()
        self.urls_to_visit = [url]
        self.domain_name = urlparse(url).netloc
        self.site_id: int | None = None

    async def fetch_url_content(self, url: str):
        """Fetches content from the given URL or a demo site."""
        normalized_url = (
            url.strip()
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
                async with session.get(url) as response:
                    response.raise_for_status()
                    content = await response.text()
                    logger.info(f"Fetched content from {url}")
                    return content
            except aiohttp.ClientError as e:
                logger.error(f"Error fetching {url}: {e}")
                raise WebsiteFetchError(f"Failed to fetch content from {url}: {e}")

    async def save_subpage_to_db(
        self, current_url: str, content: str, db: AsyncSession
    ):
        """Saves a sub-page's content to the database."""
        if self.site_id is None:
            logger.error("Cannot save a sub-page without a parent site_id.")
            return

        statement = select(SubPage).where(SubPage.url == current_url)
        result = await db.exec(statement)
        existing_subpage = result.first()

        if existing_subpage:
            logger.info(f"URL {current_url} already exists in the database. Skipping.")
            return

        sub_page = SubPage(url=current_url, content=content, site_id=self.site_id)
        db.add(sub_page)
        await db.commit()
        logger.info(f"Successfully saved content for {current_url} to database.")

    async def download_site(self, session: AsyncSession):
        """
        Downloads the entire website by crawling links within the same domain
        and saves the content.
        """
        statement = select(Site).where(Site.url == self.url)
        result = await session.exec(statement)
        site = result.first()
        if not site:
            site = Site(url=self.url)
            session.add(site)
            await session.commit()
            await session.refresh(site)

        if site.id is None:
            logger.error(f"Could not create or find a site entry for {self.url}")
            return

        self.site_id = site.id

        async with aiohttp.ClientSession() as http_session:
            while self.urls_to_visit:
                current_url = self.urls_to_visit.pop(0)

                if current_url in self.visited_urls:
                    continue

                self.visited_urls.add(current_url)

                ignored_extensions = [
                    ".css",
                    ".svg",
                    ".png",
                    ".jpg",
                    ".jpeg",
                    ".gif",
                    ".ico",
                    ".webp",
                    ".pdf",
                    ".zip",
                    ".woff",
                    ".woff2",
                    ".ttf",
                ]
                if any(
                    urlparse(current_url).path.lower().endswith(ext)
                    for ext in ignored_extensions
                ):
                    logger.info(f"Skipping non-scannable file type: {current_url}")
                    continue

                logger.info(f"Downloading: {current_url}")

                try:
                    content = await self.fetch_url_content(current_url)
                    if content is None:
                        continue

                    await self.save_subpage_to_db(current_url, content, session)

                    soup = BeautifulSoup(content, "html.parser")
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
                except WebsiteFetchError:
                    logger.warning(f"Could not download {current_url}. Skipping.")

        logger.info("\nDownload complete.")


#     # async def save_to_db(self, current_url: str, html: str, db: AsyncSession | None = None):
#     #     """Saves the fetched HTML content to the database if it doesn't already exist."""

#     #     async def _save(session: AsyncSession):
#     #         statement = select(Site).where(Site.url == current_url)
#     #         result = await session.exec(statement)
#     #         existing_site = result.first()

#     #         if existing_site:
#     #             logger.info(f"URL {current_url} already exists in the database. Skipping.")
#     #             return

#     #         site = Site(url=current_url, html=html)
#     #         session.add(site)
#     #         await session.commit()
#     #         logger.info(f"Successfully saved HTML for {current_url} to database.")

#     #     if db is None:
#     #         async with get_db_session() as session:
#     #             await _save(session)
#     #     else:
#     #         await _save(db)
