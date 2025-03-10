"use client"

import ProfileSidebar from "@/components/profile-sidebar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {
    const [folders, setFolders] = useState<any[]>([])
    const [files, setFiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isLoadingFiles, setIsLoadingFiles] = useState(false)
    const [user, setUser] = useState<{ email: string; full_name: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newFolderName, setNewFolderName] = useState("")
    const [currentFolder, setCurrentFolder] = useState<any>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [fileToDelete, setFileToDelete] = useState<any>(null)
    const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState(false)
    const [folderToDelete, setFolderToDelete] = useState<any>(null)
    const router = useRouter()

    const fetchFiles = async (folderId: number) => {
        try {
            const token = localStorage.getItem("auth_token")
            if (!token) {
                setError("No authentication token found")
                return;
            }

            const response = await fetch(`https://api.cloud.storage.bakhrom.org/get_files?folder_id=${folderId}&offset=0`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch files: ${response.status}`);
            }

            const data = await response.json();
            if (data && typeof data === 'object' && 'files' in data) {
                setFiles(data.files);
            } else {
                console.error("Unexpected response format:", data);
                setError("Invalid data format received from the server");
                setFiles([]);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch files');
            setFiles([]);
        } finally {
            setLoading(false);
            setIsLoadingFiles(false);
        }
    };

    const fetchFolders = async () => {
        try {
            const token = localStorage.getItem("auth_token")
            if (!token) {
                setError("No authentication token found")
                return;
            }

            const user_id = localStorage.getItem("user_id")
            if (!user_id) {
                setError("No user ID found")
                return
            }

            const int_user_id = parseInt(user_id)
            const response = await fetch(`https://api.cloud.storage.bakhrom.org/folders?user_id=${int_user_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch folders: ${response.status}`);
            }

            const data = await response.json();
            if (data && typeof data === 'object' && 'folders' in data) {
                setFolders(data.folders);
            } else {
                console.error("Unexpected response format:", data);
                setError("Invalid data format received from the server");
                setFolders([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching folders:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch folders');
            setLoading(false);
        }
    };

    const handleFolderClick = (folder: any) => {
        setCurrentFolder(folder);
        setIsLoadingFiles(true);
        fetchFiles(folder.folder_id);
    };

    const createFolder = async () => {
        try {
            const token = localStorage.getItem("auth_token")
            const user_id = localStorage.getItem("user_id")

            if (!token || !user_id) {
                setError("Authentication required")
                return
            }

            const response = await fetch('https://api.cloud.storage.bakhrom.org/folders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: parseInt(user_id),
                    folder_name: newFolderName
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to create folder: ${response.status}`);
            }

            // Close modal and reset form
            setIsModalOpen(false)
            setNewFolderName("")

            // Refresh the folders list
            await fetchFolders()
        } catch (error) {
            console.error('Error creating folder:', error);
            setError(error instanceof Error ? error.message : 'Failed to create folder');
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentFolder) return;

        // Check file size (5MB = 5 * 1024 * 1024 bytes)
        if (file.size > 5 * 1024 * 1024) {
            setError("File size is too large. Maximum file size is 5MB.");
            event.target.value = ''; // Reset the input
            return;
        }

        try {
            setIsUploading(true);
            const token = localStorage.getItem("auth_token");
            const user_id = localStorage.getItem("user_id");

            if (!token || !user_id) {
                setError("Authentication required");
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder_id', currentFolder.folder_id.toString());
            formData.append('user_id', user_id);

            const response = await fetch('https://api.cloud.storage.bakhrom.org/upload_file', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Failed to upload file: ${response.status}`);
            }

            // Refresh the files list
            await fetchFiles(currentFolder.folder_id);
            // Reset the file input
            event.target.value = '';
        } catch (error) {
            console.error('Error uploading file:', error);
            setError(error instanceof Error ? error.message : 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const deleteFile = async (fileId: number) => {
        try {
            const token = localStorage.getItem("auth_token")
            if (!token) {
                setError("No authentication token found")
                return;
            }

            const response = await fetch(`https://api.cloud.storage.bakhrom.org/delete_file?file_id=${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to delete file: ${response.status}`);
            }

            // Refresh the files list
            if (currentFolder) {
                await fetchFiles(currentFolder.folder_id);
            }
            setDeleteModalOpen(false);
            setFileToDelete(null);
        } catch (error) {
            console.error('Error deleting file:', error);
            setError(error instanceof Error ? error.message : 'Failed to delete file');
        }
    };

    const deleteFolder = async (folderId: number) => {
        try {
            const token = localStorage.getItem("auth_token")
            if (!token) {
                setError("No authentication token found")
                return;
            }

            const response = await fetch(`https://api.cloud.storage.bakhrom.org/folders?folder_id=${folderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to delete folder: ${response.status}`);
            }

            // Refresh the folders list
            await fetchFolders();
            setDeleteFolderModalOpen(false);
            setFolderToDelete(null);
        } catch (error) {
            console.error('Error deleting folder:', error);
            setError(error instanceof Error ? error.message : 'Failed to delete folder');
        }
    };

    useEffect(() => {
        const initializeDashboard = async () => {
            const userData = localStorage.getItem("user")
            const token = localStorage.getItem("auth_token")

            if (!userData || !token) {
                console.log("No user data or token found, redirecting to home")
                router.push("/")
                return
            }

            try {
                const parsedUser = JSON.parse(userData)
                setUser(parsedUser)
                await fetchFolders()
            } catch (error) {
                console.error("Error initializing dashboard:", error)
                setError("Failed to initialize dashboard")
            }
        }

        initializeDashboard()
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("user")
        localStorage.removeItem("auth_token") // ✅ Fix: Correct token key
        router.push("/")
    }

    if (!user) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <ProfileSidebar user={user} onLogout={handleLogout} />
            <main className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            {currentFolder ? currentFolder.folder_name : 'My Files'}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {currentFolder ? 'Viewing folder contents' : 'Manage your folders and files'}
                        </p>
                    </div>
                    {!currentFolder && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New Folder
                        </button>
                    )}
                </div>

                {currentFolder && (
                    <div className="mb-6 flex items-center justify-between">
                        <button
                            onClick={() => {
                                setCurrentFolder(null);
                                setFiles([]);
                            }}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back to Folders
                        </button>
                        <div className="relative">
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                                disabled={isUploading}
                            />
                            <label
                                htmlFor="file-upload"
                                className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Upload File
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-2xl w-[400px] shadow-2xl transform transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Create New Folder</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Enter folder name"
                                className="w-full p-3 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createFolder}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModalOpen && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-2xl w-[400px] shadow-2xl transform transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Delete File</h2>
                                <button
                                    onClick={() => {
                                        setDeleteModalOpen(false);
                                        setFileToDelete(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete this file? This action cannot be undone.</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setDeleteModalOpen(false);
                                        setFileToDelete(null);
                                    }}
                                    className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => fileToDelete && deleteFile(fileToDelete.file_id)}
                                    className="px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Folder Confirmation Modal */}
                {deleteFolderModalOpen && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-2xl w-[400px] shadow-2xl transform transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Delete Folder</h2>
                                <button
                                    onClick={() => {
                                        setDeleteFolderModalOpen(false);
                                        setFolderToDelete(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 mb-6">All the folder files will be deleted. Do you want to proceed?</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setDeleteFolderModalOpen(false);
                                        setFolderToDelete(null);
                                    }}
                                    className="px-6 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    No
                                </button>
                                <button
                                    onClick={() => folderToDelete && deleteFolder(folderToDelete.folder_id)}
                                    className="px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    Yes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
                        {error}
                    </div>
                )}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentFolder ? (
                            isLoadingFiles ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-16">
                                    <div className="bg-gradient-to-br from-gray-50 to-white p-12 rounded-2xl shadow-lg inline-block">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
                                        <p className="text-gray-600 text-xl font-medium">Loading files...</p>
                                        <p className="text-gray-500 mt-2">Please wait while we fetch the folder contents</p>
                                    </div>
                                </div>
                            ) : files.length > 0 ? (
                                files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-200 flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-xl text-gray-800 group-hover:text-blue-600 transition-colors truncate">{file.file_name}</h3>
                                                <p className="text-sm text-gray-500 mt-1">Created {new Date(file.created_at).toLocaleDateString()}</p>
                                                <div className="flex gap-3 mt-2">
                                                    <a
                                                        href={file.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-500 hover:text-blue-600 inline-block"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Download
                                                    </a>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFileToDelete(file);
                                                            setDeleteModalOpen(true);
                                                        }}
                                                        className="text-sm text-red-500 hover:text-red-600 inline-block"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-16">
                                    <div className="bg-gradient-to-br from-gray-50 to-white p-12 rounded-2xl shadow-lg inline-block">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-600 text-xl font-medium">No files found</p>
                                        <p className="text-gray-500 mt-2">This folder is empty</p>
                                    </div>
                                </div>
                            )
                        ) : (
                            folders.length > 0 ? (
                                folders.map((folder, index) => (
                                    <div
                                        key={index}
                                        className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div
                                                className="flex items-center gap-4 flex-1 cursor-pointer"
                                                onClick={() => handleFolderClick(folder)}
                                            >
                                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-200">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-xl text-gray-800 group-hover:text-blue-600 transition-colors">{folder.folder_name}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Created {new Date(folder.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFolderToDelete(folder);
                                                    setDeleteFolderModalOpen(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-16">
                                    <div className="bg-gradient-to-br from-gray-50 to-white p-12 rounded-2xl shadow-lg inline-block">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-600 text-xl font-medium">No folders found</p>
                                        <p className="text-gray-500 mt-2">Create your first folder to get started</p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}       