from flask import request, jsonify
from utils.helper import  JWTAuth
from functools import wraps
from flask import request, jsonify

def jwt_middleware(func):
    @wraps(func)  # Preserve the original function's metadata
    def wrapper(*args, **kwargs):
        # Skip JWT verification for public routes
        if request.path in ["/login", "/send_passcode"]:
            return func(*args, **kwargs)

        # Verify JWT for all other routes
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header is required"}), 401

        token = auth_header.split(" ")[1]
        result = JWTAuth().verify_token(token)  # Your token verification logic
        if result["status"] == "error":
            return jsonify({"error": result["message"]}), 401

        return func(*args, **kwargs)
    return wrapper