import random
import jwt
from dotenv import load_dotenv
import os
import requests
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
import datetime

load_dotenv()
passcode_dict = {
    "baxromumarov10@gmail.com": "123456"
}

class JWTAuth:
    def __init__(self, algorithm="HS256", expiration_days=1):
        
        self.secret_key = os.getenv("JWT_SECRET_KEY")
        if not self.secret_key:
            raise ValueError("Secret key is missing in the .env file")
        
        self.algorithm = algorithm
        self.expiration_days = expiration_days

    def generate_token(self, email):
        payload = {
            "email": email,
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=self.expiration_days),
        }
        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        return token

    def verify_token(self, token):
        try:
            decoded = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return decoded
        except jwt.ExpiredSignatureError:
            return {"error": "Token expired"}
        except jwt.InvalidTokenError:
            return {"error": "Invalid token"}
    def generate_passcode(self):
        return random.randint(100000, 999999)

    def generate_token(self,email):
        return jwt.encode({"email": email}, os.getenv("JWT_SECRET_KEY"), algorithm="HS256")

    def verify_token(self,token):
        return jwt.decode(token, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"])


class Helper(JWTAuth):
    def __init__(self):
        super().__init__()

   

    def send_telegram_bot_message(self,email):
        bot_token = os.getenv("TELEGRAM_BOT_TOKEN") 
        chat_id = os.getenv("TELEGRAM_CHAT_ID")

        if not bot_token or not chat_id:
            raise ValueError("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set")
    


        passcode = self.generate_passcode()
        passcode_dict[email] = str(passcode)

        # Format message as a spoiler
        formatted_message = f"Email: ```{email}```\nOne time passcode: ```\n{passcode}\n```"
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


    def upload_file_to_s3(file_name, object_name=None):
        """
        Upload a file to an S3 bucket.

        :param file_name: File to upload (path to the file).
        :param bucket_name: Name of the S3 bucket.
        :param object_name: S3 object name. If not specified, file_name is used.
        :return: True if file was uploaded, else False.
        """
        # If S3 object_name is not specified, use file_name
        if object_name is None:
            object_name = file_name

        # Create an S3 client using credentials from .env
        bucket_name = os.getenv("AWS_BUCKET_NAME")
        aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        aws_default_region = os.getenv('AWS_DEFAULT_REGION')

        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_default_region
        )

        try:
            # Upload the file
            s3_client.upload_file(file_name, bucket_name, object_name)
            print(f"File '{file_name}' uploaded to '{bucket_name}/{object_name}'.")
            return True
        except FileNotFoundError:
            print(f"The file '{file_name}' was not found.")
            return False
        except NoCredentialsError:
            print("Credentials not available.")
            return False
        except PartialCredentialsError:
            print("Incomplete credentials provided.")
            return False
        except Exception as e:
            print(f"An error occurred: {e}")
            return False
