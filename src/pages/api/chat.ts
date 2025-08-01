import type { NextApiRequest, NextApiResponse } from 'next';

// pages/api/chat.ts
export default async function handler(req, res) {
  try {
    const { transcript } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // make sure this exists
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: transcript }],
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      console.error("Unexpected OpenAI response:", data);
      return res.status(500).json({ message: "OpenAI API error", raw: data });
    }

    const message = data.choices[0].message.content;
    res.status(200).json({ message });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
