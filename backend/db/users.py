from db.db import DB
from utils import models

class Users(DB):
    def __init__(self):
        super().__init__()
        self.conn = self.conn
        self.cursor = self.conn.cursor()

    def create_user(self, user: models.User):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO users (full_name, email, passcode) VALUES (%s, %s, %s) RETURNING user_id", (user.full_name, user.email, user.passcode))
        self.conn.commit()
        user_id = cursor.fetchone()[0]
        cursor.close()
        return user_id

    def get_user(self, email: str):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        if not user:
            return None
        return user
        
    def create_user_folder(self, folder: models.Folder):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO folders (folder_name, user_id, parent_folder_id) VALUES (%s, %s, %s) RETURNING folder_id", (folder.folder_name, folder.user_id, folder.parent_folder_id))
        self.conn.commit()
        folder_id = cursor.fetchone()[0]
        cursor.close()
        return folder_id
    
    def create_user_file(self, file: models.File):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO files (file_name, file_size, file_type, file_path, user_id, folder_id) VALUES (%s, %s, %s, %s, %s, %s)", (file.file_name, file.file_size, file.file_type, file.file_path, file.user_id, file.folder_id))
        self.conn.commit()
        cursor.close()
    
