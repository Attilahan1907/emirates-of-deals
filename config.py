"""
BargainBot Konfiguration
Wird beim Start geladen. Fehlt die .env Datei, startet eine einmalige Setup-Routine.
"""

import os
from pathlib import Path

ENV_FILE = Path(__file__).parent / ".env"


def _load_dotenv():
    """Lädt die .env Datei in os.environ, ohne externe Abhängigkeit."""
    if not ENV_FILE.exists():
        return
    with open(ENV_FILE, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


def _save_env(values: dict):
    """Schreibt Key-Value-Paare in die .env Datei."""
    lines = []
    if ENV_FILE.exists():
        with open(ENV_FILE, encoding="utf-8") as f:
            lines = f.readlines()

    existing_keys = {}
    for i, line in enumerate(lines):
        if "=" in line and not line.strip().startswith("#"):
            key = line.split("=")[0].strip()
            existing_keys[key] = i

    for key, value in values.items():
        entry = f"{key}={value}\n"
        if key in existing_keys:
            lines[existing_keys[key]] = entry
        else:
            lines.append(entry)

    with open(ENV_FILE, "w", encoding="utf-8") as f:
        f.writelines(lines)


def _setup_routine():
    """Einmalige interaktive Einrichtung, wird nur ausgeführt wenn .env fehlt."""
    print("\n" + "=" * 50)
    print("  BargainBot – Ersteinrichtung")
    print("=" * 50)
    print("Die Konfigurationsdatei (.env) wurde nicht gefunden.")
    print("Bitte einmalig die Zugangsdaten eingeben.\n")

    config = {}

    # Telegram
    print("--- Telegram ---")
    print("Bot-Token von @BotFather (leer lassen zum Überspringen):")
    token = input("  TELEGRAM_BOT_TOKEN: ").strip()
    if token:
        config["TELEGRAM_BOT_TOKEN"] = token

    # WhatsApp (optional)
    print("\n--- WhatsApp via Twilio (optional, Enter zum Überspringen) ---")
    wa_url = input("  WHATSAPP_API_URL: ").strip()
    wa_token = input("  WHATSAPP_API_TOKEN: ").strip()
    if wa_url:
        config["WHATSAPP_API_URL"] = wa_url
    if wa_token:
        config["WHATSAPP_API_TOKEN"] = wa_token

    if config:
        _save_env(config)
        print(f"\n✓ Konfiguration gespeichert in {ENV_FILE}")
    else:
        # Leere .env anlegen damit die Routine nicht erneut startet
        ENV_FILE.touch()
        print("\n⚠ Keine Daten eingegeben. Leere .env angelegt.")

    print("=" * 50 + "\n")


def load_config():
    """
    Hauptfunktion: Lädt die Konfiguration oder startet die Setup-Routine.
    Muss als erstes in main.py aufgerufen werden.
    Auf Railway sind Env-Vars bereits gesetzt → Setup überspringen.
    """
    if not ENV_FILE.exists():
        if os.environ.get('TELEGRAM_BOT_TOKEN'):
            # Auf Server (z.B. Railway) – Env-Vars bereits gesetzt, kein interaktives Setup
            ENV_FILE.touch()
        else:
            _setup_routine()
    _load_dotenv()
