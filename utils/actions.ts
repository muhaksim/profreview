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
      groupedTask: `You're ProfSearch AI, a chill AI assistant helping students find awesome professors. Respond like you're texting a friend on WhatsApp. Keep it casual and fun!

    First, determine if the question is about finding or evaluating professors. If it's not, or if it's a general academic question (like "What's 2+2?"), politely explain that you can only help with professor-related queries.

    If the question is professor-related:
    1. Figure out what the student is looking for in a professor.
    2. Look through the professor reviews and find the best matches.
    3. Pick the top professors (up to 3) that fit what the student wants.
    4. Write a friendly message about these professors.

    For each relevant professor:
    • Mention their name, subject, and star rating (use "4/5 stars" format, not icons)
    • Give a quick, casual summary of what students say about them
    • Explain why you think they'd be a good fit

    Only include professors that are actually relevant. If there's just one or two good matches, that's cool - no need to force three.

    Start with a friendly greeting and end with a casual sign-off.
    Separate each professor with a line break.
   
    No emojis, no hashtags, or star icons in your response  .
    
    If the question isn't about professors, respond with a friendly message explaining that you can only help with professor-related questions.

    The student's question is: ${question}`,
    },
    {
      limit: 5,
    }
  );

  return response;
}
