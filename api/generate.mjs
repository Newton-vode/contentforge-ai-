
export default async function handler(request) {
    if (request.method !== "POST") {
        return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            {
                status: 405,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    try {
        const { idea, contentType } = await request.json();

        if (!idea || !contentType) {
            return new Response(
                JSON.stringify({ error: "Idea and content type are required." }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "AI service is not configured yet." }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const prompt = `
You are ContentForge AI, a professional content creation assistant.

Create high-quality original content based on the user's request.

Content type: ${contentType}

User's idea:
${idea}

Make the content engaging, natural, useful and ready to publish.
Do not explain your process. Return only the finished content.
`;

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-5.6-luna",
                    input: prompt
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);

            return new Response(
                JSON.stringify({
                    error: "The AI service returned an error."
                }),
                {
                    status: response.status,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        return new Response(
            JSON.stringify({
                content: data.output_text
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );

    } catch (error) {
        console.error(error);

        return new Response(
            JSON.stringify({
                error: "Something went wrong while generating content."
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
              }
