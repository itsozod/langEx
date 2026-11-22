import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Platform, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthFormField from '@/screens/auth/_shared/components/auth-form-field';
import AuthPrimaryButton from '@/screens/auth/_shared/components/auth-primary-button';
import { LanguagePicker } from '@/screens/onboarding/components/language-picker';
import { EditProfileInterests } from '@/screens/profile/components/edit-profile-interests';
import { useUpdateProfileMutation } from '@/screens/profile/hooks';
import { editProfileSchema, type EditProfileFormValues } from '@/screens/profile/schemas';
import { SettingsHeader } from '@/screens/profile/components/settings-header';
import { FilterChip } from '@/shared/components/ui/filter-chip';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { InputWithIcon } from '@/shared/components/ui/input-with-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { getLevelLabel, LEVELS } from '@/shared/constants/language-levels';
import { useTheme } from '@/shared/hooks/use-theme';
import { useUserStore } from '@/shared/store/user.store';
import { useEditProfileStyles } from './styles/edit-profile-styles';
import { useTranslation } from 'react-i18next';
import { translateMessage } from '@/shared/i18n/translate-message';

// Space kept below the focused field: Save button (54), its gap, and a two-line server error.
const SAVE_BUTTON_CLEARANCE = 150;

export default function EditProfile() {
  const themeColors = useTheme();
  const styles = useEditProfileStyles();
  const { t } = useTranslation(['profile', 'onboarding']);
  const user = useUserStore((state) => state.user);
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
        message: error instanceof Error ? error.message : t('edit.saveFailed'),
      });
    }
  };

  return (
    <GradientBackground>
      <KeyboardAwareScrollView
        bottomOffset={SAVE_BUTTON_CLEARANCE}
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        style={styles.keyboardView}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <SettingsHeader fallbackHref="/(tabs)/profile" title={t('edit.title')} />

            <View style={styles.formCard}>
              <AuthFormField
                label={t('onboarding:step1.displayName')}
                error={errors.displayName?.message}>
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
                      placeholder={t('edit.displayNamePlaceholder')}
                      autoCapitalize="words"
                      disabled={updateMutation.isPending}
                    />
                  )}
                />
              </AuthFormField>

              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <ThemedText style={styles.label}>{t('onboarding:step5.bio')}</ThemedText>
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
                      placeholder={t('edit.bioPlaceholder')}
                      placeholderTextColor={styles.placeholder.color}
                      textAlignVertical="top"
                      style={[styles.textArea, errors.bio && styles.inputError]}
                    />
                  )}
                />
                {errors.bio?.message ? (
                  <ThemedText style={styles.error}>
                    {translateMessage(t, errors.bio.message)}
                  </ThemedText>
                ) : null}
              </View>

              <Controller
                control={control}
                name="nativeLanguage"
                render={({ field: { onChange, value } }) => (
                  <LanguagePicker
                    label={t('onboarding:step3.nativeLanguage')}
                    placeholder={t('onboarding:step3.nativeLanguagePlaceholder')}
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
                    label={t('onboarding:step3.learningLanguage')}
                    placeholder={t('onboarding:step3.learningLanguagePlaceholder')}
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
                <ThemedText style={styles.label}>{t('edit.proficiency')}</ThemedText>
                <Controller
                  control={control}
                  name="proficiencyLevel"
                  render={({ field: { onChange, value } }) => (
                    <View accessibilityRole="radiogroup" style={styles.levelRow}>
                      {LEVELS.map((level) => (
                        <FilterChip
                          key={level.value}
                          label={getLevelLabel(level.value)}
                          onPress={() => {
                            onChange(level.value);
                            clearErrors('root.server');
                          }}
                          selected={value === level.value}
                        />
                      ))}
                    </View>
                  )}
                />
              </View>

              <Controller
                control={control}
                name="interests"
                render={({ field: { onChange, value } }) => (
                  <EditProfileInterests
                    disabled={updateMutation.isPending}
                    error={errors.interests?.message}
                    onChange={onChange}
                    onClearErrors={() => {
                      clearErrors('interests');
                      clearErrors('root.server');
                    }}
                    value={value}
                  />
                )}
              />

              {errors.root?.server?.message ? (
                <View style={styles.serverError}>
                  <ThemedText style={styles.serverErrorText}>
                    {errors.root.server.message}
                  </ThemedText>
                </View>
              ) : null}

              <AuthPrimaryButton
                label={updateMutation.isPending ? t('edit.saving') : t('edit.save')}
                pending={updateMutation.isPending}
                onPress={() => void handleSubmit(onSave)()}
              />
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </GradientBackground>
  );
}
