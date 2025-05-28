const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

export const uploadKnowledge = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/add_to_knowledge_base`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to upload file" }));
    throw new Error(error.message || "Failed to upload file");
  }
};
