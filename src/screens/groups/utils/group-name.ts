export function normalizeGroupName(value: string) {
  return value.trim().replace(/\s+/gu, ' ');
}

export function getGroupNameError(value: string) {
  const normalized = normalizeGroupName(value);
  if (!normalized) return 'Enter a group name.';
  if (Array.from(normalized).length > 80) return 'Use 80 characters or fewer.';
  return null;
}
