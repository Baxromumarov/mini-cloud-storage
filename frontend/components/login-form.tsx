"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState(1)
  const [passcode, setPasscode] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (email && email.includes("@")) {
      setStep(2) // Move to next step immediately

      console.log("Sending passcode to:", email)

      try {
        await fetch(`https://api.cloud.storage.bakhrom.org/passcode?email=${encodeURIComponent(email)}`, {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
        })
      } catch (error) {
        console.error("Error sending passcode:", error)
      }
    }
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('https://api.cloud.storage.bakhrom.org/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          passcode,
          fullName
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to verify passcode')
      }

      const data = await response.json()
      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify({ email, fullName }))
        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        throw new Error(data.message || 'Invalid passcode')
      }
    } catch (error) {
      console.error("Authentication error:", error)
      alert(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {step === 1 ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      ) : (
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passcode">Passcode</Label>
            <Input
              id="passcode"
              type="password"
              placeholder="Enter your passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Sign In"}
          </Button>
        </form>
      )}
    </div>
  )
}

