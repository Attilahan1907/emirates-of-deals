"""
Test script für Telegram-Benachrichtigungen
Führen Sie dieses Script aus, um zu testen, ob Telegram korrekt konfiguriert ist.
"""
import os
import sys
from config import load_config
load_config()
from notifications import send_telegram

def test_telegram():
    """Test Telegram notification"""
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN', '')
    
    if not bot_token:
        print("❌ FEHLER: TELEGRAM_BOT_TOKEN Umgebungsvariable ist nicht gesetzt!")
        print("\nSo setzen Sie sie:")
        print("Windows PowerShell:")
        print('  $env:TELEGRAM_BOT_TOKEN="IHR_BOT_TOKEN"')
        print("\nWindows CMD:")
        print('  set TELEGRAM_BOT_TOKEN=IHR_BOT_TOKEN')
        print("\nLinux/Mac:")
        print('  export TELEGRAM_BOT_TOKEN="IHR_BOT_TOKEN"')
        return False
    
    print(f"✅ Bot-Token gefunden: {bot_token[:10]}...")
    
    # Chat-ID abfragen
    chat_id = input("\nGeben Sie Ihre Telegram Chat-ID ein (nur Zahlen, z.B. 123456789): ").strip()
    
    if not chat_id.isdigit():
        print("❌ Chat-ID muss eine Zahl sein!")
        return False
    
    print(f"\n📤 Sende Test-Nachricht an Chat-ID: {chat_id}...")
    
    test_message = (
        "🎉 Test-Nachricht von BargainBot!\n\n"
        "Wenn Sie diese Nachricht erhalten haben, ist Telegram korrekt konfiguriert!"
    )
    
    success = send_telegram(chat_id, test_message)
    
    if success:
        print("✅ Test erfolgreich! Sie sollten jetzt eine Nachricht auf Telegram erhalten haben.")
        print("\nSie können jetzt Preis-Alerts im Frontend einrichten!")
        return True
    else:
        print("❌ Test fehlgeschlagen!")
        print("\nMögliche Probleme:")
        print("1. Bot-Token ist falsch")
        print("2. Chat-ID ist falsch")
        print("3. Sie haben dem Bot noch keine Nachricht gesendet")
        print("4. Internetverbindung fehlt")
        print("\nTipp: Senden Sie '/start' an Ihren Bot, bevor Sie die Chat-ID verwenden.")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Telegram Test für BargainBot")
    print("=" * 50)
    print()
    
    test_telegram()
