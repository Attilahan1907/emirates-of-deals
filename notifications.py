import requests
import os

def send_whatsapp(phone_number, message):
    """Send WhatsApp message using Twilio API."""
    WHATSAPP_API_URL = os.getenv('WHATSAPP_API_URL', '')
    WHATSAPP_API_TOKEN = os.getenv('WHATSAPP_API_TOKEN', '')
    if not WHATSAPP_API_URL or not WHATSAPP_API_TOKEN:
        print(f"[WhatsApp] Not configured. Would send to {phone_number}: {message}")
        return False
    
    try:
        # Example for Twilio WhatsApp API
        # Adjust based on your provider
        response = requests.post(
            WHATSAPP_API_URL,
            auth=('ACCOUNT_SID', WHATSAPP_API_TOKEN),
            data={
                'From': 'whatsapp:+14155238886',  # Your Twilio WhatsApp number
                'To': f'whatsapp:{phone_number}',
                'Body': message
            }
        )
        
        if response.status_code == 201:
            print(f"[WhatsApp] Message sent to {phone_number}")
            return True
        else:
            print(f"[WhatsApp] Error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"[WhatsApp] Error sending message: {e}")
        return False

def send_telegram(chat_id_or_username, message):
    """Send Telegram message using Bot API."""
    TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
    if not TELEGRAM_BOT_TOKEN:
        print(f"[Telegram] Not configured. Would send to {chat_id_or_username}: {message}")
        return False

    try:
        chat_id = chat_id_or_username
        response = requests.post(
            f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage',
            json={
                'chat_id': chat_id,
                'text': message,
                'parse_mode': 'HTML'
            }
        )
        
        if response.status_code == 200:
            print(f"[Telegram] Message sent to {chat_id_or_username}")
            return True
        else:
            print(f"[Telegram] Error: {response.status_code} - {response.json()}")
            return False
            
    except Exception as e:
        print(f"[Telegram] Error sending message: {e}")
        return False

def send_telegram_via_url(chat_id, message, bot_token=None):
    """Alternative: Send Telegram via direct URL. Useful for quick testing."""
    token = bot_token or os.getenv('TELEGRAM_BOT_TOKEN', '')
    if not token:
        return False
    
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    try:
        response = requests.get(url, params={
            'chat_id': chat_id,
            'text': message
        })
        return response.status_code == 200
    except Exception as e:
        print(f"[Telegram] Error: {e}")
        return False
