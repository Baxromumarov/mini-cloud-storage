"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProfileSidebar from "@/components/profile-sidebar"
import FolderView from "@/components/folder-view"

export default function Dashboard() {
  const [user, setUser] = useState<{ email: string; fullName: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }

    setUser(JSON.parse(userData))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ProfileSidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Files</h1>
          <p className="text-gray-600">Manage your folders and files</p>
        </div>
        <FolderView />
      </main>
    </div>
  )
}

