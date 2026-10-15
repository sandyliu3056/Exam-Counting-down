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
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

FEEDS = [
    # (source label, topic, url)
    ("CNN", "World", "http://rss.cnn.com/rss/edition_world.rss"),
    ("CNN", "Tech", "http://rss.cnn.com/rss/edition_technology.rss"),
    ("BBC", "World", "https://feeds.bbci.co.uk/news/world/rss.xml"),
    ("BBC", "Science", "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml"),
    ("BBC", "Tech", "https://feeds.bbci.co.uk/news/technology/rss.xml"),
    ("NPR", "World", "https://feeds.npr.org/1004/rss.xml"),
    ("NPR", "Science", "https://feeds.npr.org/1007/rss.xml"),
    ("The Guardian", "Environment", "https://www.theguardian.com/environment/rss"),
    ("Taipei Times", "Taiwan", "https://www.taipeitimes.com/xml/index.rss"),
]
PER_SOURCE_TOPIC = 4
MAX_ITEMS = 30
MAX_AGE_DAYS = 4
# keep the tab suitable for teenagers: skip headlines that are mainly about violence or crime
AVOID = re.compile(r"\b(kill(s|ed|ing)?|dead|deaths?|die[sd]?|murder\w*|shoot\w*|gun\w*|stab\w*|rape\w*|sex\w*|suicide|bomb\w*|massacre|terror\w*|war|strikes?|attack\w*|abuse\w*|porn\w*|drugs?|corpse|execut\w*)\b", re.I)
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


def parse_feed(data, source, topic):
    """Parse RSS 2.0 or Atom bytes into a list of item dicts."""
    root = ET.fromstring(data)
    atom = "{http://www.w3.org/2005/Atom}"
    out = []
    if root.tag.endswith("rss") or root.find("channel") is not None:
        for it in root.iter("item"):
            out.append({
                "title": clean(text(it.find("title")), 200),
                "link": text(it.find("link")),
                "date": parse_date(text(it.find("pubDate"))),
                "summary": clean(text(it.find("description"))),
            })
    else:
        for it in root.iter(atom + "entry"):
            link_el = it.find(atom + "link")
            out.append({
                "title": clean(text(it.find(atom + "title")), 200),
                "link": link_el.get("href", "") if link_el is not None else "",
                "date": parse_date(text(it.find(atom + "updated")) or text(it.find(atom + "published"))),
                "summary": clean(text(it.find(atom + "summary")) or text(it.find(atom + "content"))),
            })
    for o in out:
        o["source"], o["topic"] = source, topic
    return out


def suitable(item, now):
    if not item["title"] or not item["link"].startswith(("http://", "https://")):
        return False
    if AVOID.search(item["title"]) or AVOID.search(item["summary"]):
        return False
    if item["date"] and (now - item["date"]).days > MAX_AGE_DAYS:
        return False
    if "/video" in item["link"] or "/live/" in item["link"] or "/av/" in item["link"]:
        return False
    return True


def select(items, now):
    seen, picked, per = set(), [], {}
    for it in sorted(items, key=lambda x: x["date"] or now, reverse=True):
        key = re.sub(r"[^a-z]", "", it["title"].lower().replace("&", "and"))[:60]
        bucket = (it["source"], it["topic"])
        if key in seen or not suitable(it, now) or per.get(bucket, 0) >= PER_SOURCE_TOPIC:
            continue
        seen.add(key)
        per[bucket] = per.get(bucket, 0) + 1
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
            items += parse_feed(fetch(url), source, topic)
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
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))
