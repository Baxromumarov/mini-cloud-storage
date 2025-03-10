"use client"

import { getAuthHeader } from "@/app/utils/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { File, Folder, Plus } from "lucide-react"
import { useEffect, useState } from "react"

interface Folder {
  id: number;
  name: string;
  files: File[];
}

interface File {
  id: number;
  name: string;
  type: string;
  size: number;
  created_at: string;
}

export default function FolderView() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [activeFolder, setActiveFolder] = useState<number | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false)
  const [isAddFileOpen, setIsAddFileOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const ITEMS_PER_PAGE = 10

  const fetchFolders = async (offset: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://api.cloud.storage.bakhrom.org?folder_id=2&offset=${offset}&limit=${ITEMS_PER_PAGE}`,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch folders')
      }

      const data = await response.json()
      setFolders(prev => offset === 0 ? data.folders : [...prev, ...data.folders])
      setHasMore(data.folders.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching folders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFolders(0)
  }, [])

  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchFolders(nextPage * ITEMS_PER_PAGE)
  }

  const handleAddFolder = async () => {
    if (newFolderName.trim()) {
      try {
        const response = await fetch('https://api.cloud.storage.bakhrom.org/folders', {
          method: 'POST',
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newFolderName,
            parent_id: 2 // Root folder ID
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create folder')
        }

        const data = await response.json()
        setFolders(prev => [...prev, data])
        setNewFolderName("")
        setIsAddFolderOpen(false)
      } catch (error) {
        console.error('Error creating folder:', error)
        alert('Failed to create folder')
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !activeFolder) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder_id', activeFolder.toString())

      const response = await fetch('https://api.cloud.storage.bakhrom.org/upload', {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const data = await response.json()

      // Update the folders state with the new file
      setFolders(prev => prev.map(folder => {
        if (folder.id === activeFolder) {
          return {
            ...folder,
            files: [...folder.files, data]
          }
        }
        return folder
      }))

      setIsAddFileOpen(false)
      setSelectedFile(null)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Folders</h2>
        <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="folderName">Folder Name</Label>
                <Input
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                />
              </div>
              <Button onClick={handleAddFolder} className="w-full">
                Create Folder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((folder) => (
          <Card
            key={folder.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveFolder(folder.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Folder className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-medium">{folder.name}</h3>
                  <p className="text-sm text-gray-500">{folder.files.length} files</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {activeFolder !== null && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Files in {folders.find((f) => f.id === activeFolder)?.name}</h2>
            <Dialog open={isAddFileOpen} onOpenChange={setIsAddFileOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New File</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Select File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileUpload}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders
              .find((f) => f.id === activeFolder)
              ?.files.map((file) => (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <File className="h-8 w-8 text-gray-500" />
                      <div>
                        <h3 className="font-medium">{file.name}</h3>
                        <p className="text-sm text-gray-500">{file.type.toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

