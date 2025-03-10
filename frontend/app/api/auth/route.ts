import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, passcode, full_name } = body

        // Validate inputs
        if (!email || !passcode || !full_name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Send request to the external API
        const response = await fetch('https://api.cloud.storage.bakhrom.org/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                passcode,
                full_name
            }),
        })

        const data = await response.json()

        if (response.status !== 200) {
            return NextResponse.json({ error: data.error || 'Authentication failed' }, { status: response.status })
        }

        // Create response with token and user_id
        const responseData = {
            success: true,
            token: data.token,
            user_id: data.user_id,
            message: 'Login successful'
        }

        // Create response object with cookie
        const res = NextResponse.json(responseData, { status: 200 })

        // Set HTTP-only cookie for additional security
        res.cookies.set('token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        })

        return res
    } catch (error) {
        console.error("Authentication error:", error)
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
    }
}

