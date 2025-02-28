import psycopg2
import os
from dotenv import load_dotenv
from utils import models

load_dotenv()

class DB:
    def __init__(self):
        self.conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),  
            password=os.getenv("DB_PASSWORD"))
        
    def create_user(self, user: models.User):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO users (full_name, email, passcode) VALUES (%s, %s, %s)", (user.full_name, user.email, user.passcode))
        self.conn.commit()
        cursor.close()
        
    def create_user_folder(self, folder: models.Folder):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO folders (folder_name, user_id, parent_folder_id) VALUES (%s, %s, %s)", (folder.folder_name, folder.user_id, folder.parent_folder_id))
        self.conn.commit()
        cursor.close()
    
    def create_user_file(self, file: models.File):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO files (file_name, file_size, file_type, file_path, user_id, folder_id) VALUES (%s, %s, %s, %s, %s, %s)", (file.file_name, file.file_size, file.file_type, file.file_path, file.user_id, file.folder_id))
        self.conn.commit()
        cursor.close()
    
    
    
    
    
    