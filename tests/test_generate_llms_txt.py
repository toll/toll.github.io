import importlib.util
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "generate_llms_txt", ROOT / "scripts" / "generate_llms_txt.py"
)
GENERATOR = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = GENERATOR
SPEC.loader.exec_module(GENERATOR)


class GenerateLlmsTxtTest(unittest.TestCase):
    def test_committed_file_matches_generator(self):
        self.assertEqual(
            (ROOT / "llms.txt").read_text(encoding="utf-8"),
            GENERATOR.generate(ROOT),
        )

    def test_every_html_page_is_linked_once(self):
        generated = GENERATOR.generate(ROOT)
        for path in ROOT.rglob("*.html"):
            url = GENERATOR.page_url(path.relative_to(ROOT), GENERATOR.DEFAULT_BASE_URL)
            self.assertEqual(generated.count(f"]({url})"), 1, path)

    def test_parser_normalizes_title_text_and_entities(self):
        parser = GENERATOR.PageMetadataParser()
        parser.feed('<html lang="en"><title> Fish &amp;\n chips </title></html>')
        self.assertEqual(parser.title, "Fish & chips")
        self.assertEqual(parser.declared_language, "en")

    def test_markdown_link_text_is_escaped(self):
        self.assertEqual(
            GENERATOR.markdown_link_text(r"A [draft] \\"),
            r"A \[draft\] \\\\",
        )


if __name__ == "__main__":
    unittest.main()
