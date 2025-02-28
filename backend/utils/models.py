from dataclasses import dataclass
from pydantic import BaseModel
from typing import Optional  # Import Optional from typing



class User(BaseModel):
    user_id: Optional[int] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    passcode: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
class Folder(BaseModel):
    folder_id: Optional[int] = None
    folder_name: Optional[str] = None
    user_id: Optional[int] = None
    parent_folder_id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class File(BaseModel):
    file_id: Optional[int] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    file_path: Optional[str] = None
    user_id: Optional[int] = None
    folder_id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None



