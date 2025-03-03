import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, passcode, full_name } = body

        // Validate inputs
        if (!email || !passcode || !full_name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Validate passcode is a valid number
        const parsedPasscode = parseInt(passcode)
        if (isNaN(parsedPasscode)) {
            return NextResponse.json({ error: "Passcode must be a valid number" }, { status: 400 })
        }

        let requestBody = JSON.stringify({
            passcode: parsedPasscode,
            full_name: full_name,
            email: email
        })



        // Send request to the external API
        const response = await fetch('https://api.cloud.storage.bakhrom.org/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
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

