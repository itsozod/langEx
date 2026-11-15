export function normalizeGroupName(value: string) {
  return value.trim().replace(/\s+/gu, ' ');
}

export function getGroupNameError(value: string) {
  const normalized = normalizeGroupName(value);
  if (!normalized) return 'groups:validation.nameRequired';
  if (Array.from(normalized).length > 80) return 'groups:validation.nameTooLong';
  return null;
}
