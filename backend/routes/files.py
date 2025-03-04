from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import os
from utils.helper import Helper
from db.files import Files

files_bp = Blueprint("files", __name__)
helper = Helper()
db = Files()
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the folder exists

@files_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    folder_id = request.form.get("folder_id")
    user_id = request.form.get("user_id")

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    file_url = helper.upload_file_to_s3(file_path)

    if not file_url:
        os.remove(file_path)
        return jsonify({"error": "Failed to upload file"}), 500
    
    os.remove(file_path)
    db.insert_file(file.filename, folder_id, user_id,file_url)

    return jsonify({"message": "File uploaded successfully", "file_url": file_url}), 200
