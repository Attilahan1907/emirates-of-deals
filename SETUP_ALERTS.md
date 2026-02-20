# Preis-Alerts Setup Anleitung

## Übersicht

Das BargainBot-System unterstützt Preis-Alerts mit WhatsApp und Telegram-Benachrichtigungen. Wenn ein Produktpreis unter einen festgelegten Schwellenwert fällt, erhalten Sie automatisch eine Benachrichtigung.

## Frontend Setup

Das Frontend ist bereits konfiguriert und funktioniert mit localStorage für Favoriten. Preis-Alerts werden automatisch an das Backend gesendet.

## Backend Setup

### 1. WhatsApp Integration (Twilio)

**Option A: Twilio WhatsApp Business API**

1. Registrieren Sie sich bei [Twilio](https://www.twilio.com/)
2. Erstellen Sie ein Konto und holen Sie sich:
   - Account SID
   - Auth Token
3. Aktivieren Sie die WhatsApp Sandbox oder Business API
4. Setzen Sie Umgebungsvariablen:

```bash
export WHATSAPP_API_URL="https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json"
export WHATSAPP_API_TOKEN="YOUR_AUTH_TOKEN"
```

**Option B: Alternative WhatsApp APIs**

- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [ChatAPI](https://www.chatapi.com/)
- [Wati.io](https://wati.io/)

Passen Sie `notifications.py` entsprechend an.

### 2. Telegram Integration

1. Öffnen Sie Telegram und suchen Sie nach [@BotFather](https://t.me/BotFather)
2. Senden Sie `/newbot` und folgen Sie den Anweisungen
3. Speichern Sie den Bot-Token
4. Setzen Sie die Umgebungsvariable:

```bash
export TELEGRAM_BOT_TOKEN="8456931234:AAEGlnX_qZfdA2VXq_2UFy9s6Bx5-6f_VuY"
```

5. Benutzer müssen zuerst eine Nachricht an Ihren Bot senden, damit Sie Benachrichtigungen erhalten können
6. Um die Chat-ID zu erhalten, senden Sie `/start` an Ihren Bot und besuchen Sie:
   ```
   https://api.telegram.org/bot<8456931234:AAEGlnX_qZfdA2VXq_2UFy9s6Bx5-6f_VuY>/getUpdates
   ```
   Die Chat-ID finden Sie in der Antwort

### 3. Preis-Monitoring starten

Das Backend startet automatisch einen Monitoring-Service, der alle 30 Minuten die Preise prüft.

**Manuell starten:**

```bash
python price_monitor.py
```

**Als Hintergrunddienst:**

```bash
# Linux/Mac
nohup python price_monitor.py > monitor.log 2>&1 &

# Windows (PowerShell)
Start-Process python -ArgumentList "price_monitor.py" -WindowStyle Hidden
```

## Verwendung

1. **Favorit hinzufügen:**
   - Klicken Sie auf das Herz-Icon auf einem Produkt
   - Das Produkt wird zu Ihren Favoriten hinzugefügt

2. **Preis-Alert einrichten:**
   - Klicken Sie auf das Glocken-Icon auf einem Produkt
   - Geben Sie den gewünschten Alert-Preis ein
   - Wählen Sie WhatsApp oder Telegram
   - Geben Sie Ihre Kontaktinformationen ein
   - Klicken Sie "Alert speichern"

3. **Watchlist anzeigen:**
   - Klicken Sie auf "Watchlist" im Header
   - Sehen Sie alle Ihre Favoriten und aktiven Alerts

4. **Alert entfernen:**
   - Gehen Sie zur Watchlist
   - Klicken Sie auf das Glocken-Icon mit Strich, um den Alert zu entfernen
   - Oder entfernen Sie das gesamte Favorit

## API Endpunkte

- `GET /alerts` - Alle Alerts abrufen
- `POST /alerts` - Neuen Alert erstellen
- `DELETE /alerts/<id>` - Alert löschen
- `POST /alerts/check` - Manuell alle Alerts prüfen

## Wichtige Hinweise

- **Preisprüfung:** Das System prüft alle 30 Minuten automatisch
- **Rate Limiting:** Beachten Sie die Rate-Limits Ihrer API-Provider

- **Datenschutz:** Kontaktinformationen werden lokal gespeichert und nur für Benachrichtigungen verwendet

- **Preisgenauigkeit:** Die Genauigkeit hängt von der Verfügbarkeit der Produktseiten ab

- **Testen:** Testen Sie zuerst mit einem niedrigen Alert-Preis, um sicherzustellen, dass alles funktioniert

## Troubleshooting

**Keine Benachrichtigungen erhalten:**
- Prüfen Sie, ob die Umgebungsvariablen gesetzt sind
- Prüfen Sie die Backend-Logs auf Fehler
- Für Telegram: Stellen Sie sicher, dass der Benutzer dem Bot eine Nachricht gesendet hat
- Für WhatsApp: Stellen Sie sicher, dass die Nummer im richtigen Format ist (mit Ländercode)

**Preise werden nicht aktualisiert:**
- Prüfen Sie die `price_alerts.json` Datei
- Überprüfen Sie die Backend-Logs
- Stellen Sie sicher, dass der Monitoring-Service läuft
