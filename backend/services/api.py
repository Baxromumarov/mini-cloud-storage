from flask import Flask, request, jsonify
from dotenv import load_dotenv
from utils import helper
from utils import models
from utils import helper
from db.db import DB
# Load environment variables from .env file
load_dotenv()




class CloudApp:
    def __init__(self):
        self.app = Flask(__name__)
        self.auth = helper.JWTAuth()
        self.db = DB()

        self.app.add_url_rule("/passcode", "send_passcode", self.send_passcode, methods=["GET"])
        self.app.add_url_rule("/user", "user_create", self.user_create, methods=["POST"])
        self.app.add_url_rule("/check_token", "check_token", self.check_token, methods=["POST"])
        self.app.add_url_rule("/upload_file", "upload_file", self.upload_file, methods=["POST"])

    def upload_file(self):
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        object_name = file.filename  # Use the file's original name as the S3 object name

        # Upload the file to S3
        if helper.upload_file_to_s3(file, object_name):
            return jsonify({"message": "File uploaded successfully", "object_name": object_name}), 200
        else:
            return jsonify({"error": "Failed to upload file"}), 500
    

    def send_passcode(self):
        email = request.args.get("email")
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        helper.send_telegram_bot_message(email)
        return jsonify({"message": "Passcode sent successfully"}), 200

    def user_create(self):
        user = models.User(
            full_name=request.json.get("full_name"),
            email=request.json.get("email"),
            passcode=request.json.get("passcode"),
        )

        print(user)
        if not user.email:
            return jsonify({"error": "Email is required"}), 400
        if not user.passcode:
            return jsonify({"error": "Pass code is required"}), 400
        
        if not helper.passcode_dict.get(user.email) or helper.passcode_dict[user.email] != user.passcode:
            return jsonify({"error": "Invalid passcode"}), 400
        
        token = self.auth.generate_token(user.email)
        helper.passcode_dict.pop(user.email)

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
