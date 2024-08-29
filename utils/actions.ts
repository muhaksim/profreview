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

async function fetchData() {
  client = await initClient();
  const reviews = await client.collections.get("Reviews");
  const response = await reviews.query.nearText("those who teach math", {
    limit: 5,
  });

  console.log("Items from weaviate: ", response.objects);
}
