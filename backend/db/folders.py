from db.db import DB
from utils import models

class Folder(DB):
    def __init__(self):
        super().__init__()
        self.conn = self.conn
        self.cursor = self.conn.cursor()

    def create_folder(self, folder: models.Folder):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO folders (folder_name, user_id, parent_folder_id) VALUES (%s, %s, %s) RETURNING folder_id", (folder.folder_name, folder.user_id, folder.parent_folder_id))
        self.conn.commit()
        folder_id = cursor.fetchone()[0]
        return folder_id
        
    def get_folder(self, folder_id: int):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM folders WHERE folder_id = %s", (folder_id,))
        folder = cursor.fetchone()
        return folder
    
    def get_all_folders(self, user_id: int):
        cursor = self.conn.cursor()
        totalFolders =0 
        cursor.execute("SELECT COUNT(*) FROM folders WHERE user_id = %s", (user_id,))
        totalFolders = cursor.fetchone()[0]
        cursor.execute("SELECT * FROM folders WHERE user_id = %s", (user_id,))
        folders = cursor.fetchall()

        result = []
        for folder in folders:
            result.append({
                "folder_id": folder[0],
                "folder_name": folder[1],
                "user_id": int(folder[2]),
                "created_at": str(folder[4]),  
                "updated_at": str(folder[5])   
            })
        return result, totalFolders
        
    def get_folder_by_name(self, folder_name: str, user_id: int):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM folders WHERE folder_name = %s AND user_id = %s", (folder_name, user_id))
        folder = cursor.fetchone()
        return folder

    def update_folder(self, folder: models.Folder):
        cursor = self.conn.cursor()
        cursor.execute("UPDATE folders SET folder_name = %s, user_id = %s, parent_folder_id = %s WHERE folder_id = %s", (folder.folder_name, folder.user_id, folder.parent_folder_id, folder.folder_id))
        self.conn.commit()

    def delete_folder(self, folder_id: int):
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM folders WHERE folder_id = %s", (folder_id,))
        self.conn.commit()
        
        