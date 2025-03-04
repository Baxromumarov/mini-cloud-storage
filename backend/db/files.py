from db.db import DB

class Files(DB):
    def __init__(self):
        super().__init__()
        self.conn = self.conn
        self.cursor = self.conn.cursor()
    
    def insert_file(self, file_name: str, folder_id: int, user_id: int,file_url: str):
        self.cursor.execute("INSERT INTO files (file_name,folder_id,user_id,file_url) VALUES (%s, %s, %s, %s)", (file_name, folder_id, user_id,file_url ))
        self.conn.commit()
        self.cursor.close()
        
    def get_file(self, file_id: int):
        self.cursor.execute("SELECT * FROM files WHERE file_id = %s", (file_id,))
        file = self.cursor.fetchone()
        self.cursor.close()
        return file
        
    def get_all_files(self, folder_id: int):
        self.cursor.execute("SELECT * FROM files WHERE folder_id = %s", (folder_id,))
        files = self.cursor.fetchall()
        self.cursor.close()
        return files
        
        
    def delete_file(self, file_id: int):
        self.cursor.execute("DELETE FROM files WHERE file_id = %s", (file_id,))
        self.conn.commit()
        self.cursor.close()
        
    def update_file(self, file_id: int, file_name: str, file_url: str, folder_id: int):
        self.cursor.execute("UPDATE files SET file_name = %s, file_url = %s, folder_id = %s WHERE file_id = %s", (file_name, file_url, folder_id, file_id))
        self.conn.commit()
        self.cursor.close()
        
        
    def get_file_by_name(self, file_name: str):
        self.cursor.execute("SELECT * FROM files WHERE file_name = %s", (file_name,))
        file = self.cursor.fetchone()
        self.cursor.close()
        return file
        
        