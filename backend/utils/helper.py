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
            "sub": email,  
            "email": email,
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=self.expiration_days),
            "iat": datetime.datetime.now(datetime.timezone.utc)
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

class Helper(JWTAuth):
    def __init__(self):
        super().__init__()
        self.bucket_name = os.getenv("AWS_BUCKET_NAME")
        self.aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        self.aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        self.aws_default_region = os.getenv('AWS_DEFAULT_REGION')
        if not all([self.bucket_name, self.aws_access_key_id, self.aws_secret_access_key, self.aws_default_region]):
            raise ValueError("AWS credentials are missing in the environment variables.")

        # Create an S3 client
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
            region_name=self.aws_default_region
        )

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

        

    def upload_file_to_s3(self, file_name, object_name=None):
        """
        Upload a file to an S3 bucket and generate a pre-signed URL for downloading.

        :param file_name: File to upload (path to the file).
        :param object_name: S3 object name. If not specified, file_name is used.
        :return: Pre-signed URL if file was uploaded, else None.
        """
        if object_name is None:
            object_name = file_name

        try:
            # Upload the file to S3
            self.s3_client.upload_file(file_name, self.bucket_name, object_name)
            print(f"✅ File '{file_name}' uploaded to '{self.bucket_name}/{object_name}'.")
            
            public_url = self.generate_public_url(object_name)
            print(f"🔗 Public URL: {public_url}")
            

            return public_url

        except FileNotFoundError:
            print(f"❌ The file '{file_name}' was not found.")
            return None
        except NoCredentialsError:
            print("❌ AWS credentials not available.")
            return None
        except PartialCredentialsError:
            print("❌ Incomplete AWS credentials provided.")
            return None
        except Exception as e:
            print(f"❌ An error occurred: {e}")
            return None
        
    def generate_public_url(self, object_name):
        """
        Generate a direct public URL for an S3 object.

        :param object_name: S3 object name.
        :return: Direct public URL as a string.
        """
        public_url = f"https://{self.bucket_name}.s3.{self.aws_default_region}.amazonaws.com/{object_name}"
        return public_url

    # def generate_presigned_url(self, object_name, expiration=3600):
    #     """
    #     Generate a pre-signed URL to download an S3 object.

    #     :param object_name: S3 object name.
    #     :param expiration: Expiration time in seconds (default: 1 hour).
    #     :return: Pre-signed URL as a string.
    #     """
    #     try:
    #         url = self.s3_client.generate_presigned_url(
    #             'get_object',
    #             Params={
    #                 'Bucket': self.bucket_name,
    #                 'Key': object_name
    #             },
    #             ExpiresIn=expiration
    #         )
    #         return url
    #     except Exception as e:
    #         print(f"❌ Failed to generate pre-signed URL: {e}")
    #         return None
