export default async function handler(request, response) {
    if (request.method !== "POST") {
        return response.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { idea, contentType } = request.body || {};

        if (!idea || !contentType) {
            return response.status(400).json({
                error: "Idea and content type are required."
            });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return response.status(500).json({
                error: "AI service is not configured."
            });
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

        const openaiResponse = await fetch(
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

        const data = await openaiResponse.json();

        if (!openaiResponse.ok) {
            console.error(data);

            return response.status(openaiResponse.status).json({
                error: "The AI service returned an error."
            });
        }

    const content =
    data.output?.[0]?.content?.find(
        item => item.type === "output_text"
    )?.text || "";

return response.status(200).json({
    content: content
});

    } catch (error) {
        console.error(error);

        return response.status(500).json({
            error: "Something went wrong while generating content."
        });
    }
}
