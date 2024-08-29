"use server";
import weaviate, { WeaviateClient } from "weaviate-client";
import dotenv from "dotenv";

dotenv.config();

let client: WeaviateClient | null = null;

async function initClient() {
  if (!client) {
    client = await weaviate.connectToWeaviateCloud(
      process.env.WEAVIATE_HOST_URL!!,
      {
        authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_ADMIN_KEY!!),
        headers: {
          "X-Openai-Api-Key": process.env.OPENAI_API_KEY!!,
        },
      }
    );
  }

  const isReady = await client.isReady();
  console.log(`Weaviate is ready?: ${isReady}`);

  return client;
}

export async function vectorSearch(searchTerm: string) {
  client = await initClient();
  const reviews = await client.collections.get("Reviews");
  const response = await reviews.query.nearText(searchTerm, {
    limit: 5,
  });

  return response;
}

export async function RAG(question: string) {
  client = await initClient();
  const reviews = await client.collections.get("Reviews");
  const response = await reviews.generate.nearText(
    question,
    {
      groupedTask: `You are ProfSearch AI, a friendly AI assistant helping students find the best professors. When a student asks a question, use the professor reviews to find the top 3 most relevant matches. Keep your response casual and easy to read, like you're texting a friend.

    Instructions:
    
    1. Analyze the student's question to figure out what they're looking for.
    2. Search the professor reviews to find the best matches.
    3. Rank the top 3 professors based on how well they fit the student's needs.
    4. Present your findings in a friendly, bullet-point format.
    
    For each professor, include:
    • Name and subject
    • Star rating (out of 5)
    • A brief, casual summary of their feedback
    • Why you think they're a good match
    
    Start with a friendly greeting and end with a casual sign-off.
    
    The student's question is: ${question}`,
    },
    {
      limit: 3,
    }
  );

  return response;
}
