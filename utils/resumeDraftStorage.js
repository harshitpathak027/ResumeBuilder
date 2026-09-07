import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = 'rb_resume_draft';

export const EMPTY_RESUME_DRAFT = {
  title: '',
  templateId: null,
  personal: null,
  education: [],
  experience: [],
  skills: [],
  projects: [],
};

export const getResumeDraft = async () => {
  const raw = await AsyncStorage.getItem(DRAFT_KEY);
  if (!raw) return { ...EMPTY_RESUME_DRAFT };

  try {
    return { ...EMPTY_RESUME_DRAFT, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_RESUME_DRAFT };
  }
};

export const saveResumeDraft = async (updates) => {
  const current = await getResumeDraft();
  const next = { ...current, ...updates };
  await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  return next;
};

export const clearResumeDraft = async () => {
  await AsyncStorage.removeItem(DRAFT_KEY);
};

export const isResumeDraftComplete = (draft) => (
  Boolean(draft?.personal?.firstName?.trim() && draft?.personal?.lastName?.trim() && draft?.personal?.email?.trim())
  && draft.education?.length > 0
  && draft.experience?.length > 0
  && draft.skills?.length > 0
  && draft.projects?.length > 0
);
