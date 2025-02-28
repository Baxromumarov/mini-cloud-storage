from flask import Blueprint, request, jsonify
from utils import helper
from flask_jwt_extended import jwt_required

files_bp = Blueprint("files", __name__)

@files_bp.route("/upload_file", methods=["POST"])
@jwt_required()
def upload_file():
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