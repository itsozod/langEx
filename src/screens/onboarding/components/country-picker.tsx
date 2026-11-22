import { SymbolView } from '@/shared/components/ui/symbol-view';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { getLocalizedCountries } from '@/screens/onboarding/data';
import { useTranslation } from 'react-i18next';
import { translateMessage } from '@/shared/i18n/translate-message';

type CountryPickerProps = {
  value: string;
  error?: string;
  onChange: (countryCode: string) => void;
};

export function CountryPicker({ value, error, onChange }: CountryPickerProps) {
  const styles = useStyles();
  const { t, i18n } = useTranslation(['onboarding', 'common']);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const localizedCountries = useMemo(() => getLocalizedCountries(i18n.language), [i18n.language]);
  const selectedCountry = localizedCountries.find((country) => country.code === value);
  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return localizedCountries;

    return localizedCountries.filter(
      (country) =>
        country.label.toLowerCase().includes(query) ||
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query),
    );
  }, [localizedCountries, search]);

  const close = () => {
    setSearch('');
    setIsOpen(false);
  };

  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{t('pickers.country')}</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('pickers.chooseCountry')}
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          error && styles.triggerError,
          pressed && styles.pressed,
        ]}>
        <View style={styles.triggerValue}>
          {selectedCountry ? (
            <CountryFlag country={selectedCountry.code} size={21} boxSize={28} />
          ) : (
            <SymbolView
              name={{ ios: 'globe', android: 'public', web: 'public' }}
              size={21}
              tintColor={styles.icon.color}
            />
          )}
          <ThemedText style={[styles.triggerText, !selectedCountry && styles.placeholder]}>
            {selectedCountry
              ? `${selectedCountry.label} (${selectedCountry.code})`
              : t('pickers.selectCountry')}
          </ThemedText>
        </View>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'arrow_drop_down', web: 'arrow_drop_down' }}
          size={19}
          tintColor={styles.icon.color}
        />
      </Pressable>
      {error ? <ThemedText style={styles.error}>{translateMessage(t, error)}</ThemedText> : null}

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <ThemedText type="bold" style={styles.modalTitle}>
              {t('pickers.chooseCountry')}
            </ThemedText>
            <Pressable onPress={close} hitSlop={10}>
              <ThemedText style={styles.done}>{t('common:actions.done')}</ThemedText>
            </Pressable>
          </View>
          <View style={styles.searchWrapper}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              size={18}
              tintColor={styles.icon.color}
            />
            <TextInput
              autoFocus
              value={search}
              onChangeText={setSearch}
              placeholder={t('pickers.searchCountries')}
              placeholderTextColor={styles.placeholder.color}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.searchInput}
            />
          </View>
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                {t('pickers.noCountries')}
              </ThemedText>
            }
            renderItem={({ item }) => {
              const selected = item.code === value;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item.code);
                    close();
                  }}
                  style={({ pressed }) => [
                    styles.countryRow,
                    selected && styles.countryRowSelected,
                    pressed && styles.pressed,
                  ]}>
                  <View style={styles.countryIdentity}>
                    <CountryFlag country={item.code} size={20} boxSize={27} />
                    <ThemedText style={styles.countryName}>{item.label}</ThemedText>
                  </View>
                  <View style={styles.codeArea}>
                    <ThemedText themeColor="textSecondary" style={styles.code}>
                      {item.code}
                    </ThemedText>
                    {selected ? (
                      <SymbolView
                        name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                        size={18}
                        weight="semibold"
                        tintColor="#7B68E0"
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    field: { gap: 7 },
    label: {
      color: isDark ? '#F4F2F8' : '#18151F',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    trigger: {
      height: 58,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'transparent',
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(24,21,31,0.06)',
    },
    triggerError: { borderColor: '#D2364B' },
    triggerValue: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 11 },
    triggerText: { flex: 1, fontSize: 15 },
    placeholder: { color: isDark ? '#6E6979' : '#A9A4B1' },
    icon: { color: isDark ? '#9A95A6' : '#77727F' },
    pressed: { opacity: 0.65 },
    error: { color: isDark ? '#FF6B7D' : '#D2364B', fontSize: 12, lineHeight: 17 },
    modalSafeArea: { flex: 1, backgroundColor: isDark ? '#121117' : '#FCFCFD' },
    modalHeader: {
      minHeight: 56,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,21,31,0.09)',
    },
    modalTitle: { fontSize: 16 },
    done: { color: isDark ? '#A898FF' : '#5F4CC9', fontSize: 14, fontWeight: '700' },
    searchWrapper: {
      height: 48,
      margin: 16,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(24,21,31,0.06)',
    },
    searchInput: { flex: 1, height: '100%', color: isDark ? '#F4F2F8' : '#18151F', fontSize: 15 },
    listContent: { paddingHorizontal: 16, paddingBottom: 24 },
    countryRow: {
      minHeight: 54,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 12,
    },
    countryRowSelected: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(24,21,31,0.05)',
    },
    countryIdentity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
    countryName: { flex: 1, fontSize: 15 },
    codeArea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    code: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
    emptyText: { paddingVertical: 40, textAlign: 'center', fontSize: 14 },
  });
};
