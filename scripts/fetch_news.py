#!/usr/bin/env python3
"""Fetch today's English headlines for the News tab and write news.json.

Runs daily in GitHub Actions (see .github/workflows/news.yml). Standard library only.
Only titles, links, dates and the short summaries that the publishers put in their
RSS feeds are stored; every item links back to the original article.
"""
import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

FEEDS = [
    # (source label, topic, url). Sections are chosen for meaningful, teen-friendly reading
    # (science, technology, health, education, culture, environment) rather than politics or crime.
    # "cnn-lite" is CNN's text-only site: no RSS, so headlines and dates are read from its links.
    ("CNN", "", "https://lite.cnn.com/"),
    ("CNN 10", "Student news", "http://rss.cnn.com/services/podcasting/cnn10/rss.xml"),
    ("BBC", "Science", "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml"),
    ("BBC", "Tech", "https://feeds.bbci.co.uk/news/technology/rss.xml"),
    ("BBC", "Education", "https://feeds.bbci.co.uk/news/education/rss.xml"),
    ("NPR", "Science", "https://feeds.npr.org/1007/rss.xml"),
    ("NPR", "Health", "https://feeds.npr.org/1128/rss.xml"),
    ("NPR", "Tech", "https://feeds.npr.org/1019/rss.xml"),
    ("NPR", "Education", "https://feeds.npr.org/1013/rss.xml"),
    ("The Guardian", "Environment", "https://www.theguardian.com/environment/rss"),
    ("The Guardian", "Science", "https://www.theguardian.com/science/rss"),
    ("Taipei Times", "Taiwan", "https://www.taipeitimes.com/xml/index.rss"),
]
CNN_SECTIONS = {"tech": "Tech", "health": "Health", "science": "Science", "climate": "Environment", "travel": "Travel",
                "style": "Culture", "sport": "Sports", "sports": "Sports", "business": "Business", "weather": "Weather", "food": "Food"}
SKIP_PREFIX = re.compile(r"^(video|watch|listen|podcast|live|opinion|quiz|in pictures)\b", re.I)
PER_SOURCE_TOPIC = 3
PER_SOURCE = 7
MAX_ITEMS = 30
MAX_AGE_DAYS = 4
# keep the tab suitable for teenagers: skip headlines that are mainly about violence or crime
AVOID = re.compile(r"\b(kill(s|ed|ing)?|dead|deaths?|die[sd]?|murder\w*|shoot\w*|gun\w*|stab\w*|rape\w*|sex\w*|suicide|bomb\w*|massacre|terror\w*|wars?|strikes?|attack\w*|abuse\w*|porn\w*|drugs?|corpse|execut\w*"
                   r"|battlefield|military|troops|missiles?|weapons?|arrest\w*|allegation\w*|alleged\w*|police|crime\w*|criminal\w*|prison\w*|jail\w*"
                   r"|lawsuits?|sued|scandal\w*|fraud\w*|hostages?|invasion|army|soldiers?|violen\w*|riots?|assault\w*|traffick\w*|smuggl\w*|injur\w*|crash\w*|cancer"
                   r"|suicides?|self-harm\w*|overdos\w*)\b", re.I)
UA = "Mozilla/5.0 (compatible; TVE-English-Countdown news bot; +https://github.com/sandyliu3056/Exam-Counting-down)"


def text(el):
    return (el.text or "").strip() if el is not None else ""


def clean(s, limit=220):
    s = html.unescape(re.sub(r"<[^>]+>", " ", s or ""))
    s = re.sub(r"\s+", " ", s).strip()
    if len(s) > limit:
        s = s[: limit - 1].rsplit(" ", 1)[0] + "…"
    return s


def parse_date(s):
    if not s:
        return None
    try:
        d = parsedate_to_datetime(s)
    except (TypeError, ValueError):
        try:
            d = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except ValueError:
            return None
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    return d.astimezone(timezone.utc)


def parse_cnn_lite(data, source):
    """CNN Lite lists headlines as links like /2026/10/14/health/some-story; the date and section come from the URL."""
    page = data.decode("utf-8", "replace")
    out, seen = [], set()
    for m in re.finditer(r'<a[^>]+href="(?:https://lite\.cnn\.com)?(/(\d{4})/(\d{2})/(\d{2})/([a-z-]+)/[^"]+)"[^>]*>(.*?)</a>', page, re.S):
        path, y, mo, d, section, title = m.groups()
        topic = CNN_SECTIONS.get(section)
        if not topic or path in seen:
            continue
        seen.add(path)
        try:
            date = datetime(int(y), int(mo), int(d), 12, tzinfo=timezone.utc)
        except ValueError:
            continue
        out.append({"title": clean(title, 200), "link": "https://lite.cnn.com" + path, "date": date, "summary": "", "source": source, "topic": topic})
    return out


def parse_feed(data, source, topic):
    """Parse RSS 2.0, RSS 1.0 (RDF) or Atom bytes into a list of item dicts."""
    root = ET.fromstring(data)
    local = lambda el: el.tag.rsplit("}", 1)[-1].lower()

    def child(el, *names):
        for c in el:
            if local(c) in names:
                return c
        return None

    out = []
    # works for RSS 2.0 <item>, RSS 1.0 / RDF <item> (namespaced) and Atom <entry>
    for it in root.iter():
        if local(it) not in ("item", "entry"):
            continue
        link_el = child(it, "link")
        link = (link_el.get("href") or (link_el.text or "")).strip() if link_el is not None else ""
        date_el = child(it, "pubdate", "date", "updated", "published")
        sum_el = child(it, "description", "summary", "content")
        out.append({
            "title": clean(text(child(it, "title")), 200),
            "link": link,
            "date": parse_date(text(date_el)),
            "summary": clean(text(sum_el)),
        })
    for o in out:
        o["source"], o["topic"] = source, topic
    return out


def suitable(item, now):
    if not item["title"] or not item["link"].startswith(("http://", "https://")) or SKIP_PREFIX.search(item["title"]):
        return False
    if AVOID.search(item["title"]) or AVOID.search(item["summary"]):
        return False
    if not item["date"] or (now - item["date"]).days > MAX_AGE_DAYS or item["date"] > now + timedelta(days=1):
        return False
    if "/video" in item["link"] or "/live/" in item["link"] or "/av/" in item["link"]:
        return False
    return True


def select(items, now):
    seen, picked, per, per_src = set(), [], {}, {}
    for it in sorted(items, key=lambda x: x["date"] or now, reverse=True):
        key = re.sub(r"[^a-z]", "", it["title"].lower().replace("&", "and"))[:60]
        bucket = (it["source"], it["topic"])
        if key in seen or not suitable(it, now) or per.get(bucket, 0) >= PER_SOURCE_TOPIC or per_src.get(it["source"], 0) >= PER_SOURCE:
            continue
        seen.add(key)
        per[bucket] = per.get(bucket, 0) + 1
        per_src[it["source"]] = per_src.get(it["source"], 0) + 1
        picked.append(it)
    return picked[:MAX_ITEMS]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/xml, text/xml"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read()


def main(out_path="news.json"):
    now = datetime.now(timezone.utc)
    items, ok, failed = [], [], []
    for source, topic, url in FEEDS:
        try:
            data = fetch(url)
            got = parse_cnn_lite(data, source) if "lite.cnn.com" in url else parse_feed(data, source, topic)
            usable = sum(1 for g in got if suitable(g, now))
            print(f"  {source}/{topic or 'all'}: {len(got)} items, {usable} usable")
            items += got
            ok.append(f"{source}/{topic}")
        except Exception as e:  # one bad feed must not stop the others
            failed.append(f"{source}/{topic}: {e.__class__.__name__}")
    picked = select(items, now)
    print(f"feeds ok={len(ok)} failed={len(failed)} items={len(items)} picked={len(picked)}")
    for f in failed:
        print("  failed:", f)
    if not picked:
        print("No headlines picked; keeping the existing news.json.")
        return 1
    data = {
        "updated": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "items": [{**{k: v for k, v in it.items() if k != "date"}, "date": it["date"].strftime("%Y-%m-%dT%H:%M:%SZ") if it["date"] else ""} for it in picked],
    }
    # keep earlier AI lessons (scripts/make_lessons.py) whose stories are still in today's list
    try:
        with open(out_path, encoding="utf-8") as f:
            old = json.load(f)
        links = {i["link"] for i in data["items"]}
        kept = [l for l in old.get("lessons", []) if l.get("link") in links]
        if kept:
            data["lessons"], data["lessonsDate"] = kept, old.get("lessonsDate", "")
            if old.get("lessonsModel"):
                data["lessonsModel"] = old["lessonsModel"]
    except (OSError, ValueError):
        pass
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))
