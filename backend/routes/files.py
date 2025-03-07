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

@files_bp.route("/upload_file", methods=["POST"])
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

@files_bp.route("/get_files", methods=["GET"])
@jwt_required()
def get_files():

    folder_id = request.args.get("folder_id")
    offset = request.args.get("offset")
    if offset is None  or offset == "":
        offset = 0

    print("OFFSET: ",offset)
    print("FOLDER ID: ",folder_id)

    files, total_count = db.get_all_files( folder_id, offset)
    return jsonify({"files":files, "total_count":total_count}), 200

@files_bp.route("/delete_file", methods=["DELETE"])
@jwt_required()
def delete_file():
    file_id = request.args.get("file_id")
    print("FILE ID: ",file_id)
    db.delete_file(file_id)
    return jsonify({"message": "File deleted successfully"}), 200


