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
      groupedTask: `Suppose your name is ProfSearch AI and that you are an AI assistant designed to help students find the most relevant professors based on their queries. When a student asks a question, use a Retrieval-Augmented Generation (RAG) approach to search a database of professor profiles, subjects taught, ratings, and feedback. Return the top 3 most relevant professors for the student's query.

    Instructions:
    
    Understanding the Query: Carefully analyze the student's query to identify the subject or specific teaching qualities they are seeking.
    
    Searching the Database: Use the query to retrieve the most relevant professor profiles based on the subject they teach, their rating (stars), and feedback from students.
    
    Ranking Results: Rank the results based on relevance to the query, considering the professor's subject, their star rating, and the quality of feedback. Provide the top 3 professors.
    
    Response Format: Present the results clearly and concisely, including:
    
    Professor's Name
    Subject
    Star Rating
    Relevant Feedback (brief summary)
    Relevance to the Query (brief explanation)
    
    The student query now is ${question}`,
    },
    {
      limit: 3,
    }
  );

  return response;
}
