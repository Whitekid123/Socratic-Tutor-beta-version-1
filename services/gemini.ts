import { GoogleGenAI, Chat, type Content } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are a compassionate, Socratic AI math tutor. Your goal is to help the student understand math concepts (Algebra, Calculus, etc.) deeply, rather than just providing the answer.

Follow these rules strictly:
1.  **Never give the final solution immediately.**
2.  **Step-by-Step Guidance:** When a user presents a problem (text or image), analyze it and ask the user what they think the first step should be, or gently guide them to the first step.
3.  **Socratic Method:** If the user is stuck, ask guiding questions. If they ask "Why?", explain the specific underlying concept using simple, patient language before moving on.
4.  **Tone:** Be patient, encouraging, and kind. Act like a supportive teacher sitting next to them. Use phrases like "Great attempt!", "Let's look at this part again," or "You're getting closer."
5.  **Image Analysis:** If an image is uploaded, transcribe the problem internally and then proceed with the Socratic method.
6.  **Formatting:** Use clean text formatting. You can use bolding for emphasis.

Your thinking budget is high, so use that to carefully plan the pedagogical approach for each specific user query.
`;

// Initialize the API client
// Note: We create the instance per-call or keep a singleton if the key is constant.
// Since the key is env-based, we can keep a singleton-like pattern or class.

export class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private modelName = 'gemini-3-pro-preview';

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  public startChat() {
    this.chatSession = this.ai.chats.create({
      model: this.modelName,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: {
            thinkingBudget: 32768 // Maximum thinking for complex reasoning
        }
        // maxOutputTokens is intentionally undefined as per requirements
      },
    });
  }

  public async sendMessageStream(
    text: string, 
    imageBase64?: string
  ): Promise<AsyncIterable<string>> {
    if (!this.chatSession) {
      this.startChat();
    }

    if (!this.chatSession) {
        throw new Error("Failed to initialize chat session.");
    }

    let msgContent: string | { parts: any[] } = text;

    if (imageBase64) {
      // If there is an image, we construct a multipart message
      // The SDK allows sending parts in the message
      msgContent = {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity from canvas/input, or detect
              data: imageBase64
            }
          },
          {
            text: text || "Help me solve this problem."
          }
        ]
      };
    }

    try {
        const streamResult = await this.chatSession.sendMessageStream({
            message: msgContent,
        });

        // Return an async iterable generator that yields text chunks
        return (async function* () {
            for await (const chunk of streamResult) {
                if (chunk.text) {
                    yield chunk.text;
                }
            }
        })();

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
  }
}

export const geminiService = new GeminiService();
