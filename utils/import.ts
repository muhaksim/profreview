import weaviate, { WeaviateClient } from "weaviate-client";
import "dotenv/config";
import * as fs from "fs/promises";
import { join } from "path";
import { Review } from "../types";
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

async function createCollection() {
  client = await initClient();

  const response = await client.collections.create({
    name: "Reviews",
    vectorizers: weaviate.configure.vectorizer.text2VecOpenAI({
      model: "text-embedding-3-small",
      sourceProperties: ["professor", "subject", "stars", "feedback"],
    }),
    generative: weaviate.configure.generative.openAI(),
  });

  console.log("Collection is created", response.name);
}

interface ReviewsData {
  reviews: Review[];
}

async function importData(
  fileName: string,
  collectionName: string
): Promise<void> {
  client = await initClient();

  const filePath = join(process.cwd(), `./${fileName}`);
  const fileContent = await fs.readFile(filePath, "utf-8");
  const jsonData: ReviewsData = JSON.parse(fileContent);

  const review = client.collections.get(collectionName);

  let itemsToInsert: Review[] = [];
  let counter = 0;

  for (const item of jsonData.reviews) {
    counter++;

    if (counter % 5 === 0) console.log(`${counter} reviews imported`);

    itemsToInsert.push({
      professor: item.professor,
      subject: item.subject,
      stars: item.stars,
      feedback: item.feedback,
    });

    if (itemsToInsert.length === 5) {
      const response = await review.data.insertMany(itemsToInsert);
      itemsToInsert = [];

      if (response.hasErrors) {
        console.error(
          "Error details:",
          JSON.stringify(response.errors, null, 2)
        );
        throw new Error(`Error inserting data. Check console for details.`);
      }
    }
  }

  if (itemsToInsert.length > 0) {
    const response = await review.data.insertMany(itemsToInsert);
    if (response.hasErrors) {
      console.error("Error details:", JSON.stringify(response.errors, null, 2));
      throw new Error(`Error inserting data. Check console for details.`);
    }
  }

  console.log(`Items inserted successfully.`);
}

async function fetchData() {
  client = await initClient();
  const reviews = await client.collections.get("Reviews");
    const response = await reviews.query.nearText('those who teach math', {
      limit: 5
  })

  console.log("Items from weaviate: ", response.objects);
}

fetchData();

// importData("reviews.json", "Reviews");
