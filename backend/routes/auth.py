from flask import Blueprint, request, jsonify
from utils import helper, models
from db.db import DB
from utils.helper import Helper
# from flask_jwt_extended import jwt_required, get_jwt_identity
from routes.middleware import jwt_middleware

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    user = models.User(
        full_name=request.json.get("full_name"),
        email=request.json.get("email"),
        passcode=request.json.get("passcode"),
    )

    if not user.email:
        return jsonify({"error": "Email is required"}), 400
    if not user.passcode:
        return jsonify({"error": "Pass code is required"}), 400

    print(helper.passcode_dict)
    if not helper.passcode_dict.get(user.email) or helper.passcode_dict[user.email] != user.passcode:
        return jsonify({"error": "Invalid passcode"}), 400

    token = helper.JWTAuth().generate_token(user.email)
    helper.passcode_dict.pop(user.email)

    db = DB()
    db_user = db.get_user(user.email)
    if not db_user:
        db.create_user(user)

    return jsonify({"token": token})

@auth_bp.route("/check_token", methods=["POST"])
def check_token():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"error": "Authorization header is required"}), 400

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Authorization header must start with 'Bearer '"}), 400

    token = auth_header.split(" ")[1]
    result = helper.JWTAuth().verify_token(token)
    return jsonify(result)

@auth_bp.route("/send_passcode", methods=["GET"])
def send_passcode():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    Helper().send_telegram_bot_message(email)
    return jsonify({"message": "Passcode sent successfully"}), 200