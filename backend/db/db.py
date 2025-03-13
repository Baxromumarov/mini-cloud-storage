import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

class DB:  
    # print(os.getenv("DB_HOST"))
    # print(os.getenv("DB_NAME"))
    # print(os.getenv("DB_USER"))
    # print(os.getenv("DB_PASSWORD"))

    def __init__(self):
        self.conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),  
            password=os.getenv("DB_PASSWORD"))
        self.cursor = self.conn.cursor()
        
    def close(self):
        self.cursor.close()
        self.conn.close()
    
    
    
    
    
    
    
    
    