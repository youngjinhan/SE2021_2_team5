import algoliasearch from "algoliasearch";

export const algolia = algoliasearch(
  "K6ZBVR8PBX",
  "feb89a2a6a0b3420d940a8a0efe96d6d"
);

export const productIndex = algolia.initIndex("auction_PRODUCTS");
