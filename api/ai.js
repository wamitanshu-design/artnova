export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return res.status(500).json({
            error: 'GEMINI_API_KEY is missing in Vercel Environment Variables.',
        })
    }

    try {
        const { mode, prompt, creators = [], userProfile = {} } = req.body || {}

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ error: 'Please enter a prompt first.' })
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`

        if (mode === 'matchmaker') {
            const systemInstruction = `You are ArtNova AI, an intelligent creative talent matchmaker.
Analyze the user's project request and compare it against the registered creators list provided in JSON.
Pick up to 3 best-matching creators from the list. If there are fewer than 3 creators available, match the best available ones.
Return ONLY valid JSON with this exact structure:
{
  "summary": "1-2 sentence overview of the ideal team setup for this project",
  "matches": [
    {
      "id": "exact creator id from the input list",
      "full_name": "creator full_name",
      "username": "creator username",
      "creative_field": "creator creative_field",
      "match_score": 95,
      "reason": "Specific 1-2 sentence reason why their skills/bio fit this exact project",
      "suggested_pitch": "A short, friendly 2-sentence DM pitch the user can copy and send to this creator"
    }
  ]
}`

            const userMessage = `Project Request: "${prompt.trim()}"

Available Creators on ArtNova:
${JSON.stringify(creators, null, 2)}`

            const geminiRes = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                    generationConfig: {
                        temperature: 0.4,
                        responseMimeType: 'application/json',
                    },
                }),
            })

            const geminiData = await geminiRes.json()

            if (!geminiRes.ok) {
                return res.status(geminiRes.status).json({
                    error: geminiData?.error?.message || 'Gemini API request failed.',
                })
            }

            const rawText =
                geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
            const parsed = JSON.parse(rawText)

            return res.status(200).json({
                mode: 'matchmaker',
                summary: parsed.summary || 'Here are your top collaborator matches:',
                matches: Array.isArray(parsed.matches) ? parsed.matches : [],
            })
        }

        // Default: Creative & Collaboration Coach mode
        const coachSystem = `You are ArtNova AI Coach, a sharp, encouraging creative director and collaboration strategist for independent artists, designers, musicians, and filmmakers.
Give practical, concrete, step-by-step advice. Keep formatting clean with short paragraphs and bullet points.
User's Creator Profile: ${JSON.stringify(userProfile)}`

        const geminiRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: coachSystem }] },
                contents: [{ role: 'user', parts: [{ text: prompt.trim() }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                },
            }),
        })

        const geminiData = await geminiRes.json()

        if (!geminiRes.ok) {
            return res.status(geminiRes.status).json({
                error: geminiData?.error?.message || 'Gemini API request failed.',
            })
        }

        const reply =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'No response generated.'

        return res.status(200).json({ mode: 'coach', reply })
    } catch (err) {
        return res.status(500).json({
            error: err.message || 'Unexpected server error in ArtNova AI.',
        })
    }
}