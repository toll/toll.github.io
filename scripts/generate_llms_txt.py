#!/usr/bin/env python3
"""Generate the site's llms.txt index from its HTML documentation."""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, urljoin


DEFAULT_BASE_URL = "https://toll.github.io/"


@dataclass(frozen=True)
class Page:
    path: Path
    title: str
    declared_language: str


class PageMetadataParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.declared_language = ""
        self._in_title = False
        self._title_parts: list[str] = []

    @property
    def title(self) -> str:
        return " ".join("".join(self._title_parts).split())

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        if tag == "html":
            self.declared_language = dict(attrs).get("lang") or ""
        elif tag == "title":
            self._in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self._title_parts.append(data)


def read_page(path: Path, root: Path) -> Page:
    parser = PageMetadataParser()
    parser.feed(path.read_text(encoding="utf-8"))
    if not parser.title:
        raise ValueError(f"Missing <title> in {path.relative_to(root)}")
    return Page(path.relative_to(root), parser.title, parser.declared_language)


def language_for(page: Page, paths: set[Path]) -> str:
    if page.path.stem.endswith("-EN"):
        return "English"

    english_sibling = page.path.with_name(f"{page.path.stem}-EN.html")
    if page.path == Path("index.html") or english_sibling in paths:
        return "Norwegian"

    if page.declared_language.lower().startswith("en"):
        return "English"
    if page.declared_language.lower().startswith(("nb", "nn", "no")):
        return "Norwegian"
    return page.declared_language or "Language not declared"


def section_for(path: Path) -> str:
    if path.parent == Path("."):
        return "Start here"

    if path.name == "document-api-link.html" or path.name.startswith(
        ("movement-", "maritime-ssnn-")
    ):
        return "API references"

    sections = {
        Path("api/document"): "Document upload",
        Path("api/ics2"): "ICS2 consignments",
        Path("api/maskinporten"): "Maskinporten integration",
        Path("api/mo"): "Notification and disclosure guides",
    }
    try:
        return sections[path.parent]
    except KeyError as error:
        raise ValueError(f"No llms.txt section configured for {path}") from error


def page_url(path: Path, base_url: str) -> str:
    if path == Path("index.html"):
        return base_url
    encoded_path = "/".join(quote(part) for part in path.parts)
    return urljoin(base_url, encoded_path)


def markdown_link_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("[", "\\[").replace("]", "\\]")


def page_sort_key(page: Page, paths: set[Path]) -> tuple[str, int]:
    paired_path = page.path.as_posix().replace("-EN.html", ".html")
    language_order = 0 if language_for(page, paths) == "Norwegian" else 1
    return paired_path.casefold(), language_order


def generate(root: Path, base_url: str = DEFAULT_BASE_URL) -> str:
    base_url = f"{base_url.rstrip('/')}/"
    pages = [read_page(path, root) for path in sorted(root.rglob("*.html"))]
    paths = {page.path for page in pages}

    grouped: dict[str, list[Page]] = {}
    for page in pages:
        grouped.setdefault(section_for(page.path), []).append(page)

    section_order = (
        "Start here",
        "Document upload",
        "ICS2 consignments",
        "Maskinporten integration",
        "Notification and disclosure guides",
        "API references",
    )
    lines = [
        "# Norwegian Customs API documentation",
        "",
        "> Official Norwegian Customs documentation for public data and API services, with guides in Norwegian and English.",
        "",
        "This is a generated map of the HTML documentation. API behavior, schemas, authentication requirements, and URLs should be verified against the linked pages.",
    ]

    for section in section_order:
        section_pages = grouped.pop(section, [])
        if not section_pages:
            continue
        lines.extend(("", f"## {section}", ""))
        for page in sorted(section_pages, key=lambda item: page_sort_key(item, paths)):
            language = language_for(page, paths)
            lines.append(
                f"- [{markdown_link_text(page.title)}]({page_url(page.path, base_url)}): {language}."
            )

    if grouped:
        raise ValueError(f"Unordered llms.txt sections: {', '.join(sorted(grouped))}")

    return "\n".join(lines) + "\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help=f"Public site root (default: {DEFAULT_BASE_URL})",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Exit non-zero instead of updating an out-of-date llms.txt",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(__file__).resolve().parents[1]
    output_path = root / "llms.txt"
    generated = generate(root, args.base_url)

    if args.check:
        current = output_path.read_text(encoding="utf-8") if output_path.exists() else ""
        if current != generated:
            print("llms.txt is out of date; run scripts/generate_llms_txt.py", file=sys.stderr)
            return 1
        print("llms.txt is up to date")
        return 0

    output_path.write_text(generated, encoding="utf-8")
    print(f"Wrote {output_path.relative_to(root)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
