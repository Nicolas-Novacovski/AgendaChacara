
import { GoogleGenAI } from "@google/genai";

export const getFarmingAdvice = async (query: string): Promise<string> => {
  try {
    // Initializing Gemini with API key directly from environment variables as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `Você é um agrônomo sênior e especialista em vida rural, muito sábio e prático. 
        Seu nome é "Agrônomo Virtual".
        Responda a perguntas sobre plantio, colheita, controle de pragas, cuidados com animais e manutenção de chácaras.
        Use uma linguagem simples, direta e encorajadora, adequada para um pequeno produtor rural.
        Dê respostas concisas, preferencialmente em tópicos quando houver instruções passo-a-passo.`,
      }
    });

    // Directly accessing the text property as per GenerateContentResponse definition
    return response.text || "Desculpe, não consegui gerar uma resposta no momento.";
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return "Ocorreu um erro ao consultar o assistente virtual. Verifique sua conexão.";
  }
};
