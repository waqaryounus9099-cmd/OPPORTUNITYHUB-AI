export async function generateAssistantReply({ message, context = {} }) {
  const provider = process.env.AI_PROVIDER || "mock";

  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("AI_PROVIDER is openai but OPENAI_API_KEY is missing.");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are OpportunityHub AI, a careful career and scholarship assistant. Never invent credentials, deadlines, eligibility rules, or job facts. Ask for missing information and direct users to official sources." },
          { role: "user", content: `User context: ${JSON.stringify(context)}\n\nQuestion: ${message}` }
        ],
        temperature: 0.5
      })
    });
    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";
  }

  return `Here is a practical way to approach that:\n\n1. Start with the official requirements and identify any must-have criteria.\n2. Compare those requirements with your real education, skills and experience.\n3. Prepare truthful, specific evidence for each requirement.\n4. Save the official application link and note the deadline.\n\nFor your question — "${message}" — I can give more tailored guidance if you share the opportunity details and relevant background. This is a demo AI response; connect an AI provider for generated assistance.`;
}
