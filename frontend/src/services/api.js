const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

async function request(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function getDeveloperGraph(name) {
  return request(
    `/developers/${encodeURIComponent(name)}/graph`
  );
}

export async function getRecommendations(name) {
  return request(
    `/developers/${encodeURIComponent(name)}/recommendations`
  );
}

export async function getRelationshipGraph(name) {
  return request(
    `/developers/${encodeURIComponent(name)}/graph/relationships`
  );
}