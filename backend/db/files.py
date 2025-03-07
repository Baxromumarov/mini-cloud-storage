from db.db import DB
from utils import models

class Files(DB):
    def __init__(self):
        super().__init__()
        self.conn = self.conn
        self.cursor = self.conn.cursor()
    
    def insert_file(self, file_name: str, folder_id: int, user_id: int,file_url: str):
        self.cursor.execute("INSERT INTO files (file_name,folder_id,user_id,file_url) VALUES (%s, %s, %s, %s)", (file_name, folder_id, user_id,file_url ))
        self.conn.commit()
        
    def get_file(self, file_id: int):
        self.cursor.execute("SELECT * FROM files WHERE file_id = %s", (file_id, ))
        file = self.cursor.fetchone()
        return file
        
    def get_all_files(self, folder_id: int, offset: int):
        self.cursor.execute(
            """
            SELECT COUNT(*) FROM files
            WHERE folder_id = %s
            """,
            (folder_id,)
        )
        total_count = self.cursor.fetchone()[0]

        self.cursor.execute(
            """
            SELECT file_id, file_name, file_url, folder_id, user_id, created_at, updated_at
            FROM files
            WHERE folder_id = %s
            LIMIT 20 OFFSET %s
            """,
            (folder_id, offset)
        )
        files = self.cursor.fetchall()

        result = []
        for file in files:
            result.append({
                "file_id": file[0],
                "file_name": file[1],
                "file_url": file[2],
                "folder_id": int(file[3]),
                "user_id": int(file[4]),
                "created_at": str(file[5]),  
                "updated_at": str(file[6])   
            })

        return result, total_count
        
        
    def delete_file(self, file_id: int):
        print("FILE ID: ",file_id)
        self.cursor.execute("DELETE FROM files WHERE file_id = %s", (file_id,))
        self.conn.commit()
        
    def update_file(self, file_id: int, file_name: str, file_url: str, folder_id: int):
        self.cursor.execute("UPDATE files SET file_name = %s, file_url = %s, folder_id = %s WHERE file_id = %s", (file_name, file_url, folder_id, file_id))
        self.conn.commit()
        
        
    def get_file_by_name(self, file_name: str):
        self.cursor.execute("SELECT * FROM files WHERE file_name = %s", (file_name,))
        file = self.cursor.fetchone()
        return file
        
        