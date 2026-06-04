"""OpenAI-style completions client for Football Coach LLM (Ollama or ngrok)."""
from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any

DEFAULT_NGROK_URL = "https://lashonda-overfoul-demandingly.ngrok-free.dev"
DEFAULT_OLLAMA_URL = "http://localhost:11434"

SYSTEM_PREFIX = (
    "You are an Advanced AI Football Coach Assistant. "
    "Use only the match data provided. Be specific, tactical, and actionable. "
    "Format your response in clear markdown with headings.\n\n"
)


def _load_dotenv() -> None:
    """Load Tactic_Zone/.env into os.environ if present (no extra dependency)."""
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if not os.path.isfile(env_path):
        return
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            key, val = key.strip(), val.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = val


_load_dotenv()


def _resolve_base_url() -> str:
    provider = os.environ.get("COACH_LLM_PROVIDER", "ngrok").lower()
    env_url = os.environ.get("COACH_LLM_BASE_URL", "").rstrip("/")
    if provider == "ollama":
        return env_url or DEFAULT_OLLAMA_URL
    if provider == "ngrok" or provider == "colab":
        return env_url or DEFAULT_NGROK_URL
    # auto: explicit URL > Colab/ngrok default > local Ollama
    if env_url:
        return env_url
    return DEFAULT_NGROK_URL


def _is_ngrok(url: str) -> bool:
    return "ngrok" in url


def _max_tokens(default: int = 800) -> int:
    return int(os.environ.get("COACH_LLM_MAX_TOKENS", default))


def _timeout() -> int:
    return int(os.environ.get("COACH_LLM_TIMEOUT", "120"))


def complete(
    prompt: str,
    max_tokens: int | None = None,
    system_prefix: str | None = SYSTEM_PREFIX,
    temperature: float = 0.7,
) -> dict[str, Any]:
    """Call POST {base}/v1/completions and return parsed result."""
    base = _resolve_base_url()
    prefix = "" if system_prefix is None else system_prefix
    full_prompt = prefix + prompt
    body = json.dumps({
        "prompt": full_prompt,
        "max_tokens": max_tokens or _max_tokens(),
        "temperature": temperature,
    }).encode("utf-8")

    headers = {"Content-Type": "application/json"}
    if _is_ngrok(base):
        headers["ngrok-skip-browser-warning"] = "true"

    req = urllib.request.Request(
        f"{base}/v1/completions",
        data=body,
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=_timeout()) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    text = ""
    if data.get("choices"):
        text = data["choices"][0].get("text", "").strip()
    provider = "ngrok" if _is_ngrok(base) else "ollama"
    return {
        "text": text,
        "model": data.get("model", "football_coach"),
        "usage": data.get("usage", {}),
        "provider": provider,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def complete_with_retry(
    prompt: str,
    max_retries: int = 3,
    delay: float = 5.0,
    **kwargs: Any,
) -> dict[str, Any] | None:
    for attempt in range(max_retries):
        try:
            result = complete(prompt, **kwargs)
            if result.get("text"):
                return result
            print(f"Coach LLM attempt {attempt + 1}/{max_retries}: empty response, retrying...")
        except urllib.error.HTTPError as e:
            base = _resolve_base_url()
            if e.code == 503:
                print(f"Coach LLM attempt {attempt + 1}/{max_retries}: Colab/ngrok tunnel offline (503). Restart your Colab notebook.")
            else:
                print(f"Coach LLM attempt {attempt + 1}/{max_retries} failed ({base}): HTTP {e.code} {e.reason}")
            if attempt < max_retries - 1:
                time.sleep(delay)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
            base = _resolve_base_url()
            print(f"Coach LLM attempt {attempt + 1}/{max_retries} failed ({base}): {e}")
            if attempt < max_retries - 1:
                time.sleep(delay)
    return None
