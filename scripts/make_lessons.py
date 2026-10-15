#!/usr/bin/env python3
"""Turn a few of today's headlines into short English lessons for the News tab.

For each chosen story Claude writes a short B1-level passage in its own words (using only
the headline and the publisher's RSS summary), then lists key vocabulary, phrases and one
or two grammar points with Traditional Chinese explanations. The result is stored in
news.json under "lessons".

Runs in GitHub Actions after fetch_news.py. Needs the ANTHROPIC_API_KEY repository secret;
without it the script does nothing, so the rest of the site keeps working.
"""
import json
import os
import re
import sys
from datetime import datetime, timezone

LESSONS_PER_DAY = 3
MODEL = "claude-opus-5-5"

SYSTEM = (
    "You write short English reading lessons for Taiwanese senior-high students (age 16-18, CEFR B1) "
    "preparing for the TVE joint college entrance exam (統測). You are given a list of today's news "
    "headlines with the publisher's short summaries."
)

INSTRUCTIONS = """Choose the {n} stories that are most meaningful and interesting for these students:
science, technology, health, education, environment, culture or Taiwan. Avoid crime, violence, war,
partisan politics, celebrity gossip and anything unsuitable for teenagers.

For each chosen story:
- "link": copy the story's link exactly.
- "title_zh": a natural Traditional Chinese (台灣用語) translation of the headline.
- "passage": 110-150 words of clear B1 English in your own words, 2 short paragraphs separated by a
  blank line. Use ONLY facts in the headline and summary. Do not invent numbers, names, quotes, dates
  or details. You may add one sentence of general background that any encyclopedia would agree with,
  and one sentence explaining why the story matters to young people. Do not copy the summary's wording.
- "vocab": 5 useful B1-B2 words that appear exactly in your passage: word (as it appears), part of
  speech (n./v./adj./adv.), Traditional Chinese meaning.
- "phrases": 3 useful multi-word phrases or collocations that appear exactly in your passage, each with
  a Traditional Chinese meaning.
- "grammar": 2 grammar points used in your passage (for example passive voice, present perfect,
  relative clause, comparative, modal verb, infinitive of purpose, gerund). For each: the point's name
  in Traditional Chinese with the English name in brackets, a one-sentence explanation in Traditional
  Chinese, and the exact sentence from your passage that shows it.

Stories (JSON):
{stories}
"""

SCHEMA = {
    "type": "object",
    "properties": {
        "lessons": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "link": {"type": "string"},
                    "title_zh": {"type": "string"},
                    "passage": {"type": "string"},
                    "vocab": {"type": "array", "items": {"type": "object", "properties": {
                        "word": {"type": "string"}, "pos": {"type": "string"}, "zh": {"type": "string"}},
                        "required": ["word", "pos", "zh"], "additionalProperties": False}},
                    "phrases": {"type": "array", "items": {"type": "object", "properties": {
                        "phrase": {"type": "string"}, "zh": {"type": "string"}},
                        "required": ["phrase", "zh"], "additionalProperties": False}},
                    "grammar": {"type": "array", "items": {"type": "object", "properties": {
                        "point": {"type": "string"}, "explain": {"type": "string"}, "example": {"type": "string"}},
                        "required": ["point", "explain", "example"], "additionalProperties": False}},
                },
                "required": ["link", "title_zh", "passage", "vocab", "phrases", "grammar"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["lessons"],
    "additionalProperties": False,
}


def norm(s):
    return re.sub(r"\s+", " ", s.lower()).strip()


def validate(lessons, items):
    """Keep only lessons that point at today's stories, and only notes that really appear in the passage."""
    by_link = {i["link"]: i for i in items}
    out = []
    for les in lessons:
        story = by_link.get(les.get("link", ""))
        passage = (les.get("passage") or "").strip()
        words = len(passage.split())
        if not story or not 80 <= words <= 200:
            continue
        text = norm(passage)
        vocab = [v for v in les["vocab"] if v["word"].strip() and norm(v["word"]) in text][:6]
        phrases = [p for p in les["phrases"] if p["phrase"].strip() and norm(p["phrase"]) in text][:4]
        grammar = [g for g in les["grammar"] if g["example"].strip() and norm(g["example"]).rstrip(".!?") in text][:3]
        out.append({
            "link": story["link"], "source": story["source"], "topic": story.get("topic", ""),
            "title": story["title"], "title_zh": les["title_zh"].strip(), "passage": passage,
            "vocab": vocab, "phrases": phrases, "grammar": grammar,
        })
    return out


def make_lessons(items):
    import anthropic  # imported here so the script still runs (and skips) where the SDK isn't installed

    stories = [{"link": i["link"], "source": i["source"], "topic": i.get("topic", ""),
                "headline": i["title"], "summary": i.get("summary", "")} for i in items]
    client = anthropic.Anthropic()
    response = client.beta.messages.create(
        model=MODEL,
        max_tokens=16000,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",  # if a request is declined, the API retries it on its recommended fallback model
        output_config={"effort": "medium", "format": {"type": "json_schema", "schema": SCHEMA}},
        system=SYSTEM,
        messages=[{"role": "user", "content": INSTRUCTIONS.format(
            n=LESSONS_PER_DAY, stories=json.dumps(stories, ensure_ascii=False, indent=1))}],
    )
    if response.stop_reason == "refusal":
        print("The request was declined:", getattr(response.stop_details, "category", None))
        return []
    if response.stop_reason == "max_tokens":
        print("The response was cut off (max_tokens); skipping today's lessons.")
        return []
    text = next(b.text for b in response.content if b.type == "text")
    return json.loads(text)["lessons"]


def main(path="news.json"):
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY is not set; skipping AI lessons.")
        return 0
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    items = data.get("items") or []
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if data.get("lessonsDate") == today and data.get("lessons"):
        print("Today's lessons already exist; nothing to do.")
        return 0
    if not items:
        print("No headlines; skipping lessons.")
        return 0
    import anthropic
    try:
        lessons = validate(make_lessons(items), items)
    except anthropic.RateLimitError:
        print("Rate limited; keeping the existing lessons.")
        return 0
    except anthropic.APIStatusError as e:
        print(f"API error {e.status_code}: {e.message}; keeping the existing lessons.")
        return 0
    except anthropic.APIConnectionError:
        print("Could not reach the API; keeping the existing lessons.")
        return 0
    if not lessons:
        print("No usable lessons; keeping the existing ones.")
        return 0
    data["lessons"], data["lessonsDate"] = lessons, today
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print(f"Wrote {len(lessons)} lessons.")
    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))
