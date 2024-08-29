import { GenerativeReturn
} from "weaviate-client";
 
export type Review = {
    professor: string,
    subject: string,
    stars: number,
    feedback: string,
}

export type SearchResponse = {
    response?: GenerativeReturn<Review>
}

