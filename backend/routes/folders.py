from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from db.folders import Folder
from utils import models
folders_bp = Blueprint("folders", __name__)

db = Folder()
@folders_bp.route("/folders", methods=["POST"])
@jwt_required()
def create_folder():
    folder = models.Folder(
        folder_name=request.json.get("folder_name"),
        user_id=request.json.get("user_id"),
        parent_folder_id=request.json.get("parent_folder_id"),
    )
    
    folder_id = db.create_folder(folder)
    return jsonify({"message": "Folder created successfully","folder_id":folder_id}), 200

@folders_bp.route("/folders", methods=["GET"])
# @jwt_required()
def get_folders():
    user_id = request.args.get("user_id")
    folders = db.get_all_folders(user_id)
    return jsonify({"folders": folders}), 200

@folders_bp.route("/folders", methods=["PUT"])
@jwt_required()
def update_folder():
    folder = models.Folder(
        folder_name=request.json.get("folder_name"),
        user_id=request.json.get("user_id"),
        parent_folder_id=request.json.get("parent_folder_id"),
    )
    db.update_folder(folder)
    return jsonify({"message": "Folder updated successfully"}), 200

@folders_bp.route("/folders", methods=["DELETE"])
@jwt_required()
def delete_folder():
    folder_id = request.args.get("folder_id")
    if not folder_id:
        return jsonify({"error": "Folder id is required"}), 400
    
    db.delete_folder(folder_id)
    return jsonify({"message": "Folder deleted successfully"}), 200

@folders_bp.route("/folders", methods=["GET"])
@jwt_required()
def get_folder():
    folder_id = request.args.get("folder_id")
    folder = db.get_folder(folder_id)
    return jsonify({"folder": folder}), 200

