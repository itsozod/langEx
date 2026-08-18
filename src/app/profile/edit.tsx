import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GradientBackground from '@/shared/components/ui/gradient-background';
import { InputWithIcon } from '@/shared/components/ui/input-with-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { LanguagePicker } from '@/screens/onboarding/components/language-picker';
import { INTERESTS } from '@/screens/onboarding/data';
import { useUpdateProfileMutation } from '@/screens/profile/hooks';
import { editProfileSchema, type EditProfileFormValues } from '@/screens/profile/schemas';
import { useTheme } from '@/shared/hooks/use-theme';
import AuthFormField from '@/screens/auth/_shared/components/auth-form-field';
import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { useAuthStore } from '@/shared/store/auth-store';

const LEVELS = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
] as const;

export default function EditProfile() {
  const themeColors = useTheme();
  const styles = useStyles();
  const user = useAuthStore((state) => state.user);
  const updateMutation = useUpdateProfileMutation();
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      displayName: user?.displayName ?? '',
      bio: user?.bio ?? '',
      nativeLanguage: user?.nativeLanguage ?? '',
      learningLanguage: user?.learningLanguage ?? '',
      proficiencyLevel: user?.proficiencyLevel ?? 'beginner',
      interests: user?.interests ?? [],
    },
  });

  const leave = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  const onSave = async (values: EditProfileFormValues) => {
    try {
      await updateMutation.mutateAsync(values);
      leave();
    } catch (error) {
      setError('root.server', {
        type: 'server',
        message: error instanceof Error ? error.message : 'Unable to save your profile.',
      });
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cancel editing"
                  disabled={updateMutation.isPending}
                  hitSlop={10}
                  onPress={leave}
                  style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
                  <SymbolView
                    name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                    size={21}
                    weight="semibold"
                    tintColor={styles.icon.color}
                  />
                </Pressable>
                <View style={styles.headerCopy}>
                  <ThemedText type="bold" style={styles.headerTitle}>
                    Edit profile
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.headerSubtitle}>
                    Keep your details fresh
                  </ThemedText>
                </View>
                <View style={styles.headerSpacer} />
              </View>

              <View style={styles.formCard}>
                <AuthFormField label="Display name" error={errors.displayName?.message}>
                  <Controller
                    control={control}
                    name="displayName"
                    render={({ field: { onBlur, onChange, value } }) => (
                      <InputWithIcon
                        icon={{ ios: 'person', android: 'person', web: 'person' }}
                        iconColor={themeColors.textSecondary}
                        hasError={Boolean(errors.displayName)}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={(text) => {
                          onChange(text);
                          clearErrors('root.server');
                        }}
                        placeholder="Your display name"
                        autoCapitalize="words"
                        disabled={updateMutation.isPending}
                      />
                    )}
                  />
                </AuthFormField>

                <View style={styles.field}>
                  <View style={styles.labelRow}>
                    <ThemedText style={styles.label}>Bio</ThemedText>
                    <Controller
                      control={control}
                      name="bio"
                      render={({ field: { value } }) => (
                        <ThemedText themeColor="textSecondary" style={styles.characterCount}>
                          {value.length}/150
                        </ThemedText>
                      )}
                    />
                  </View>
                  <Controller
                    control={control}
                    name="bio"
                    render={({ field: { onBlur, onChange, value } }) => (
                      <TextInput
                        value={value}
                        onBlur={onBlur}
                        onChangeText={(text) => {
                          onChange(text);
                          clearErrors('root.server');
                        }}
                        editable={!updateMutation.isPending}
                        multiline
                        maxLength={150}
                        placeholder="Tell people a little about yourself…"
                        placeholderTextColor={styles.placeholder.color}
                        textAlignVertical="top"
                        style={[styles.textArea, errors.bio && styles.inputError]}
                      />
                    )}
                  />
                  {errors.bio?.message ? (
                    <ThemedText style={styles.error}>{errors.bio.message}</ThemedText>
                  ) : null}
                </View>

                <Controller
                  control={control}
                  name="nativeLanguage"
                  render={({ field: { onChange, value } }) => (
                    <LanguagePicker
                      label="Native language"
                      placeholder="Select your native language"
                      value={value}
                      error={errors.nativeLanguage?.message}
                      onChange={(language) => {
                        onChange(language);
                        clearErrors('root.server');
                      }}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="learningLanguage"
                  render={({ field: { onChange, value } }) => (
                    <LanguagePicker
                      label="Learning language"
                      placeholder="Select a language to learn"
                      value={value}
                      error={errors.learningLanguage?.message}
                      onChange={(language) => {
                        onChange(language);
                        clearErrors('root.server');
                      }}
                    />
                  )}
                />

                <View style={styles.field}>
                  <ThemedText style={styles.label}>Proficiency level</ThemedText>
                  <Controller
                    control={control}
                    name="proficiencyLevel"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.levelRow}>
                        {LEVELS.map((level) => {
                          const selected = value === level.value;
                          return (
                            <Pressable
                              key={level.value}
                              disabled={updateMutation.isPending}
                              onPress={() => {
                                onChange(level.value);
                                clearErrors('root.server');
                              }}
                              style={({ pressed }) => [
                                styles.levelPill,
                                selected && styles.levelPillSelected,
                                pressed && styles.pressed,
                              ]}>
                              <ThemedText
                                style={[styles.levelText, selected && styles.levelTextSelected]}>
                                {level.label}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  />
                </View>

                <View style={styles.field}>
                  <View style={styles.labelRow}>
                    <ThemedText style={styles.label}>Interests</ThemedText>
                    <Controller
                      control={control}
                      name="interests"
                      render={({ field: { value } }) => (
                        <ThemedText themeColor="textSecondary" style={styles.characterCount}>
                          {value.length} selected · 3 minimum
                        </ThemedText>
                      )}
                    />
                  </View>
                  <Controller
                    control={control}
                    name="interests"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.interestGrid}>
                        {INTERESTS.map((interest) => {
                          const selected = value.includes(interest);
                          return (
                            <Pressable
                              key={interest}
                              accessibilityRole="checkbox"
                              accessibilityState={{ checked: selected }}
                              disabled={updateMutation.isPending}
                              onPress={() => {
                                onChange(
                                  selected
                                    ? value.filter((item) => item !== interest)
                                    : [...value, interest],
                                );
                                clearErrors('interests');
                                clearErrors('root.server');
                              }}
                              style={({ pressed }) => [
                                styles.interestPill,
                                selected && styles.interestPillSelected,
                                pressed && styles.pressed,
                              ]}>
                              <ThemedText
                                style={[
                                  styles.interestText,
                                  selected && styles.interestTextSelected,
                                ]}>
                                {interest}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  />
                  {errors.interests?.message ? (
                    <ThemedText style={styles.error}>{errors.interests.message}</ThemedText>
                  ) : null}
                </View>

                {errors.root?.server?.message ? (
                  <View style={styles.serverError}>
                    <ThemedText style={styles.serverErrorText}>
                      {errors.root.server.message}
                    </ThemedText>
                  </View>
                ) : null}

                <AuthPrimaryButton
                  label={updateMutation.isPending ? 'Saving…' : 'Save changes'}
                  pending={updateMutation.isPending}
                  onPress={() => void handleSubmit(onSave)()}
                />
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    keyboardView: {
      flex: 1,
      width: '100%',
    },
    scrollContent: {
      flexGrow: 1,
    },
    safeArea: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 36,
    },
    content: {
      width: '100%',
      maxWidth: 520,
      gap: 20,
    },
    header: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 21,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(91,70,176,0.10)',
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.78)',
    },
    icon: {
      color: isDark ? '#F0EAF9' : '#302A3A',
    },
    headerCopy: {
      flex: 1,
      alignItems: 'center',
      gap: 1,
    },
    headerTitle: {
      fontSize: 17,
      lineHeight: 23,
    },
    headerSubtitle: {
      fontSize: 11,
      lineHeight: 16,
    },
    headerSpacer: {
      width: 42,
    },
    pressed: {
      opacity: 0.65,
    },
    formCard: {
      padding: 20,
      gap: 19,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(151,134,219,0.22)' : 'rgba(91,70,176,0.10)',
      backgroundColor: isDark ? 'rgba(31,25,47,0.94)' : 'rgba(255,255,255,0.94)',
      shadowColor: isDark ? '#000000' : '#3B309E',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.2 : 0.07,
      shadowRadius: 24,
      elevation: 3,
    },
    field: {
      gap: 8,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    label: {
      color: isDark ? '#D8D0E8' : '#34303D',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    characterCount: {
      fontSize: 10,
      lineHeight: 15,
    },
    textArea: {
      minHeight: 132,
      paddingHorizontal: 15,
      paddingVertical: 13,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? '#4A405F' : '#DED8EC',
      backgroundColor: isDark ? '#171321' : '#FBFAFE',
      color: isDark ? '#F5F1FF' : '#221E2B',
      fontFamily: 'PlusJakartaSans',
      fontSize: 15,
      lineHeight: 22,
    },
    placeholder: {
      color: isDark ? '#8E849D' : '#91899E',
    },
    inputError: {
      borderColor: '#D64545',
    },
    error: {
      color: isDark ? '#FF9A9A' : '#B42318',
      fontSize: 12,
      lineHeight: 17,
    },
    levelRow: {
      flexDirection: 'row',
      gap: 8,
    },
    levelPill: {
      flex: 1,
      minHeight: 44,
      paddingHorizontal: 6,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? '#4A405F' : '#DED8EC',
      backgroundColor: isDark ? '#171321' : '#FBFAFE',
    },
    levelPillSelected: {
      borderColor: '#6654C7',
      backgroundColor: isDark ? 'rgba(102,84,199,0.28)' : '#EEEAFB',
    },
    levelText: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '600',
    },
    levelTextSelected: {
      color: isDark ? '#C9BEFF' : '#5643B4',
    },
    interestGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 9,
    },
    interestPill: {
      minHeight: 41,
      paddingHorizontal: 13,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? '#4A405F' : '#DED8EC',
      backgroundColor: isDark ? '#171321' : '#FBFAFE',
    },
    interestPillSelected: {
      borderColor: '#6654C7',
      backgroundColor: isDark ? 'rgba(102,84,199,0.28)' : '#EEEAFB',
    },
    interestText: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '600',
    },
    interestTextSelected: {
      color: isDark ? '#C9BEFF' : '#5643B4',
    },
    serverError: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,140,140,0.22)' : '#FFD0CC',
      backgroundColor: isDark ? 'rgba(255,112,112,0.10)' : '#FFF1F0',
    },
    serverErrorText: {
      color: isDark ? '#FFAAAA' : '#9F2018',
      fontSize: 12,
      lineHeight: 18,
    },
  });
};
