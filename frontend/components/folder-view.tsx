"use client"

import { useState } from "react"
import { Folder, File, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Mock data for folders and files
const initialFolders = [
  {
    id: 1,
    name: "Documents",
    files: [
      { id: 1, name: "Resume.pdf", type: "pdf" },
      { id: 2, name: "Contract.docx", type: "docx" },
    ],
  },
  {
    id: 2,
    name: "Images",
    files: [
      { id: 3, name: "Profile.jpg", type: "jpg" },
      { id: 4, name: "Banner.png", type: "png" },
    ],
  },
  {
    id: 3,
    name: "Projects",
    files: [{ id: 5, name: "Presentation.pptx", type: "pptx" }],
  },
]

export default function FolderView() {
  const [folders, setFolders] = useState(initialFolders)
  const [activeFolder, setActiveFolder] = useState<number | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFileName, setNewFileName] = useState("")
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false)
  const [isAddFileOpen, setIsAddFileOpen] = useState(false)

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = {
        id: folders.length + 1,
        name: newFolderName,
        files: [],
      }
      setFolders([...folders, newFolder])
      setNewFolderName("")
      setIsAddFolderOpen(false)
    }
  }

  const handleAddFile = () => {
    if (newFileName.trim() && activeFolder !== null) {
      const updatedFolders = folders.map((folder) => {
        if (folder.id === activeFolder) {
          return {
            ...folder,
            files: [
              ...folder.files,
              {
                id: Math.max(0, ...folder.files.map((f) => f.id)) + 1,
                name: newFileName,
                type: newFileName.split(".").pop() || "txt",
              },
            ],
          }
        }
        return folder
      })
      setFolders(updatedFolders)
      setNewFileName("")
      setIsAddFileOpen(false)
    }
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
                    <Label htmlFor="fileName">File Name</Label>
                    <Input
                      id="fileName"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="Enter file name with extension"
                    />
                  </div>
                  <Button onClick={handleAddFile} className="w-full">
                    Upload File
                  </Button>
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

