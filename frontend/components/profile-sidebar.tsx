import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ProfileSidebarProps {
  user: {
    email: string
    fullName: string
  }
  onLogout: () => void
}

export default function ProfileSidebar({ user, onLogout }: ProfileSidebarProps) {
  const initials = user.fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
      <div className="flex flex-col items-center space-y-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="font-semibold text-lg">{user.fullName}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        <a href="/dashboard" className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-100 text-gray-900">
          <User size={18} />
          <span>My Files</span>
        </a>
      </nav>

      <div className="pt-6 mt-auto">
        <Button variant="outline" className="w-full" onClick={onLogout}>
          Sign Out
        </Button>
      </div>
    </div>
  )
}

