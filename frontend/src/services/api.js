const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export async function getDeveloperGraph(name) {
  const response = await fetch(
    `${API_BASE_URL}/developers/${encodeURIComponent(name)}/graph`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch developer graph");
  }

  return response.json();
}

export async function getRecommendations(name) {
  const response = await fetch(
    `${API_BASE_URL}/developers/${encodeURIComponent(name)}/recommendations`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recommendations");
  }

  return response.json();
}