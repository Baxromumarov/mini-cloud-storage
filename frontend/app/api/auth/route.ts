import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, passcode, fullName } = body

    // Validate inputs
    if (!email || !passcode || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Send request to the external API
    const response = await fetch('https://api.cloud.storage.bakhrom.org/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        passcode: Number(passcode),
        full_name: fullName,
        email: email
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Authentication failed' }, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

