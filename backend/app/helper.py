import random
import jwt
from dotenv import load_dotenv
import os
import requests

load_dotenv()
passcode_dict = {}

def generate_pass_code():
    return random.randint(100000, 999999)

def generate_token(email):
    return jwt.encode({"email": email}, os.getenv("JWT_SECRET_KEY"), algorithm="HS256")

def verify_token(token):
    return jwt.decode(token, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
import os
import requests

def send_telegram_bot_message(email):
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN") 
    chat_id = os.getenv("TELEGRAM_CHAT_ID")

    if not bot_token or not chat_id:
        raise ValueError("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set")
  


    message = generate_pass_code()
    passcode_dict[email] = str(message)

    # Format message as a spoiler
    formatted_message = f"Email: ```{email}```\nOne time passcode: ```\n{message}\n```"
    # Escape any special characters for MarkdownV2
    # formatted_message = formatted_message.replace(".", "\\.").replace("`", "\\`")

    params = {
        'chat_id': chat_id,  # The chat_id obtained from getUpdates
        'text': formatted_message,
        'parse_mode': 'Markdown'
    }

    send_message_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    response = requests.get(send_message_url, params=params)
    if response.status_code == 200:
        print("Message sent successfully!")
    else:
        print(f"Failed to send message. Status code: {response.status_code}")
        print(response.text)
       
