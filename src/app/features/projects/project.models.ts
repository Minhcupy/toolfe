export interface VideoProject {
  id: string; ownerId: string; name: string; sourceLanguage: string; targetLanguage: string;
  subtitleEnabled: boolean; status: string; createdAt: string; updatedAt: string;
}
export interface CreateProject { name: string; sourceLanguage: string; targetLanguage: string; subtitleEnabled: boolean; }
