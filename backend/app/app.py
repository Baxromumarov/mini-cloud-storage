# helper.send_telegram_bot_message("baxromumarov10@gmail.com")

import jwt
import datetime
import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import helper

# Load environment variables from .env file
load_dotenv()

class JWTAuth:
    def __init__(self, secret_key, algorithm="HS256", expiration_days=1):
        self.secret_key = secret_key
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


class JWTApp:
    def __init__(self):
        self.app = Flask(__name__)
        
        self.secret_key = os.getenv("JWT_SECRET_KEY")
        if not self.secret_key:
            raise ValueError("Secret key is missing in the .env file")
        
        self.auth = JWTAuth(secret_key=self.secret_key) 

        self.app.add_url_rule("/passcode", "send_passcode", self.send_passcode, methods=["GET"])
        self.app.add_url_rule("/token", "generate_token", self.generate_token, methods=["GET"])
        self.app.add_url_rule("/check_token", "check_token", self.check_token, methods=["POST"])

    def send_passcode(self):
        email = request.args.get("email")
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        helper.send_telegram_bot_message(email)
        return jsonify({"message": "Passcode sent successfully"}), 200

    def generate_token(self):
        print(helper.passcode_dict)
        email = request.args.get("email")
        passcode = request.args.get("passcode")
        print(email, passcode)
        if not email:
            return jsonify({"error": "Email is required"}), 400
        if not passcode:
            return jsonify({"error": "Pass code is required"}), 400
        
        if not helper.passcode_dict.get(email) or helper.passcode_dict[email] != passcode:
            return jsonify({"error": "Invalid passcode"}), 400
        
        token = self.auth.generate_token(email)
        helper.passcode_dict.pop(email)

        return jsonify({"token": token})

    def check_token(self):   
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Authorization header is required"}), 400

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header must start with 'Bearer '"}), 400

        token = auth_header.split(" ")[1]  
        result = self.auth.verify_token(token)
        return jsonify(result)

    def run(self, debug=True):
        self.app.run(debug=debug)


if __name__ == "__main__":
    JWTApp().run()