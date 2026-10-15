#!/usr/bin/env python3
"""Read the main text of a news article page (CNN Lite, BBC, NPR, The Guardian, Taipei Times).

Used by make_lessons.py as the fact source for the rewritten study articles. The text is
only passed to the writer and never saved to news.json. Standard library only.

    python3 scripts/article_text.py URL [URL ...]   # print how many words were found on each page
"""
import re
import sys
import urllib.request
from html.parser import HTMLParser

UA = "Mozilla/5.0 (compatible; TVE-English-Countdown news bot; +https://github.com/sandyliu3056/Exam-Counting-down)"
MAX_WORDS = 1800
SKIP_TAGS = {"nav", "header", "footer", "aside", "figure", "figcaption", "form", "script", "style", "noscript", "button", "svg", "template"}
BLOCK_TAGS = {"p", "div", "section", "article", "li", "ul", "ol", "h1", "h2", "h3", "h4", "blockquote", "table"}
# Promo and caption lines. Only short paragraphs are tested, so real paragraphs that happen to start
# with "Watch", "Share" or "Photo" are kept.
BOILERPLATE = re.compile(
    r"^(sign up|subscribe (now|today|to)|follow (us|the)|read more|related:|copyright|©|photo:|image:|image source|"
    r"advertisement|listen to (this|the)|watch:|share (this|on)|get our|click here|download (the|our)|"
    r"this (article|story) (was|is|has been) (amended|updated|corrected)|you can (read|listen|watch)|"
    r"support (the|our)|we (also )?use cookies|enable javascript)|newsletter|all rights reserved|terms of (use|service)",
    re.I)
BOILERPLATE_MAX_WORDS = 40


class Paragraphs(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.buf = None
        self.out = []

    def handle_starttag(self, tag, attrs):
        if tag in SKIP_TAGS:
            self.skip += 1
        elif tag == "p":
            self._close()
            if not self.skip:
                self.buf = []
        elif tag == "br" and self.buf is not None:
            self.buf.append(" ")

    def handle_endtag(self, tag):
        if tag in SKIP_TAGS:
            self.skip = max(0, self.skip - 1)
        elif tag in BLOCK_TAGS:
            self._close()

    def handle_data(self, data):
        if self.buf is not None and not self.skip:
            self.buf.append(data)

    def _close(self):
        if self.buf is not None:
            self.out.append(re.sub(r"\s+", " ", "".join(self.buf)).strip())
        self.buf = None


def extract(page):
    parser = Paragraphs()
    parser.feed(page)
    parser.close()
    parser._close()
    paras, seen = [], set()
    for p in parser.out:
        n = len(p.split())
        if n < 8 or (n <= BOILERPLATE_MAX_WORDS and BOILERPLATE.search(p)) or p in seen:
            continue
        seen.add(p)
        paras.append(p)
    words, kept = 0, []
    for p in paras:
        kept.append(p)
        words += len(p.split())
        if words >= MAX_WORDS:
            break
    return "\n\n".join(kept)


def fetch_text(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        page = r.read(3_000_000).decode(r.headers.get_content_charset() or "utf-8", "replace")
    return extract(page)


def main(argv):
    for url in argv:
        try:
            text = fetch_text(url)
        except Exception as e:  # report and carry on with the other pages
            print(f"FAIL {url}: {e}", file=sys.stderr)
            continue
        print(f"{len(text.split()):5d} words  {url}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
