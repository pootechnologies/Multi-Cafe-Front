// src/utils/urlHelper.js
import { API_BASE_URL, IMAGE_BASE_URL } from "./apiConfig";

// Function to get dynamic base URL based on schema_name
export const getBaseURL = () => {
  const schemaName = localStorage.getItem("schema_name");
  if (schemaName && schemaName !== "public") {
    return `https://${schemaName}.cafe.pootechnologies.tech/api`;
  }
  return API_BASE_URL;
};

// Function to get dynamic image base URL based on schema_name
export const getImageBaseURL = () => {
  const schemaName = localStorage.getItem("schema_name");
  if (schemaName && schemaName !== "public") {
    return `https://${schemaName}.cafe.pootechnologies.tech/`;
  }
  return IMAGE_BASE_URL;
};
