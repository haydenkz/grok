import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const ENDPOINT =
        process.env.XAI_ENDPOINT || "https://api.x.ai/v1/chat/completions";
    const APIKEY = process.env.XAI_APIKEY;
    if (!APIKEY) {
        return NextResponse.json(
            { error: "XAI_APIKEY is not defined in environment variables" },
            { status: 500 }
        );
    }

    try {
        // Parse the incoming message log
        const messageLog = await request.json();

        if (!messageLog || !Array.isArray(messageLog)) {
            return NextResponse.json(
                { error: "Message log is missing or not an array" },
                { status: 400 }
            );
        }

        // Optional: Add a system message if not already present
        const hasSystemMessage = messageLog.some(
            (msg) => msg.role === "system"
        );
        const finalMessages = hasSystemMessage
            ? messageLog
            : [
                  {
                      role: "system",
                      content: "You are Grok, a helpful AI assistant.",
                  },
                  ...messageLog,
              ];

        console.log(`Sending ${finalMessages.length} messages to X.AI API`);

        const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": APIKEY,
            },
            body: JSON.stringify({
                messages: finalMessages,
                model: "grok-2-latest",
                stream: false,
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            const errorText = await response
                .text()
                .catch(() => "No error details available");
            console.error(`X.AI API error (${response.status}):`, errorText);
            return NextResponse.json(
                {
                    error: `X.AI API error: ${response.statusText}`,
                    details: errorText,
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (!data || !data.choices || !data.choices[0]) {
            console.error("Invalid response format from X.AI API:", data);
            return NextResponse.json(
                { error: "Invalid response format from X.AI API" },
                { status: 500 }
            );
        }

        console.log("Successfully received response from X.AI API");
        return NextResponse.json(data, { status: 200 });
    } catch (error: unknown) {
        console.error("Unhandled error in X.AI API route:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            {
                error: "Failed to process request",
                message: errorMessage,
            },
            { status: 500 }
        );
    }
}
