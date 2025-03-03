from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from routes.auth import auth_bp
from routes.files import files_bp
from utils import helper
from db.db import DB
import os
from dotenv import load_dotenv
load_dotenv()

class CloudApp:
    def __init__(self):
        self.app = Flask(__name__)
        
        # Enable CORS with specific options
        CORS(self.app, supports_credentials=True)  # Enable CORS and allow credentials
        
        self.app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
        
        self.jwt = JWTManager(self.app)
        self.helper = helper.Helper()
        self.db = DB()
        
        # Register blueprints
        self.app.register_blueprint(auth_bp)
        self.app.register_blueprint(files_bp)

    def run(self, debug=True):
        self.app.run(debug=debug)