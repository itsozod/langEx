import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { CountryFlag } from '@/screens/onboarding/components/country-flag';
import { COUNTRIES } from '@/screens/onboarding/data';

type CountryPickerProps = {
  value: string;
  error?: string;
  onChange: (countryCode: string) => void;
};

export function CountryPicker({ value, error, onChange }: CountryPickerProps) {
  const styles = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selectedCountry = COUNTRIES.find((country) => country.code === value);
  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return COUNTRIES;

    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(query) || country.code.toLowerCase().includes(query),
    );
  }, [search]);

  const close = () => {
    setSearch('');
    setIsOpen(false);
  };

  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>Country</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose your country"
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
              ? `${selectedCountry.name} (${selectedCountry.code})`
              : 'Select country'}
          </ThemedText>
        </View>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'arrow_drop_down', web: 'arrow_drop_down' }}
          size={19}
          tintColor={styles.icon.color}
        />
      </Pressable>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <ThemedText type="bold" style={styles.modalTitle}>
              Choose your country
            </ThemedText>
            <Pressable onPress={close} hitSlop={10}>
              <ThemedText style={styles.done}>Done</ThemedText>
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
              placeholder="Search countries"
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
                No countries found.
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
                    <ThemedText style={styles.countryName}>{item.name}</ThemedText>
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
                        tintColor="#6654C7"
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
      color: isDark ? '#D8D0E8' : '#34303D',
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
      borderColor: isDark ? '#4A405F' : '#DED8EC',
      backgroundColor: isDark ? '#171321' : '#FBFAFE',
    },
    triggerError: { borderColor: '#D64545' },
    triggerValue: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 11 },
    triggerText: { flex: 1, fontSize: 15 },
    placeholder: { color: isDark ? '#8E849D' : '#91899E' },
    icon: { color: isDark ? '#A9A0B6' : '#6F6879' },
    pressed: { opacity: 0.65 },
    error: { color: isDark ? '#FF9A9A' : '#B42318', fontSize: 12, lineHeight: 17 },
    modalSafeArea: { flex: 1, backgroundColor: isDark ? '#15111F' : '#FCFBFF' },
    modalHeader: {
      minHeight: 56,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? '#3A3347' : '#E4DFEC',
    },
    modalTitle: { fontSize: 16 },
    done: { color: isDark ? '#BFB1FF' : '#5B49B8', fontSize: 14, fontWeight: '700' },
    searchWrapper: {
      height: 48,
      margin: 16,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 14,
      backgroundColor: isDark ? '#211B2E' : '#F0ECF8',
    },
    searchInput: { flex: 1, height: '100%', color: isDark ? '#F5F1FF' : '#221E2B', fontSize: 15 },
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
      backgroundColor: isDark ? 'rgba(102,84,199,0.18)' : 'rgba(102,84,199,0.09)',
    },
    countryIdentity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
    countryName: { flex: 1, fontSize: 15 },
    codeArea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    code: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
    emptyText: { paddingVertical: 40, textAlign: 'center', fontSize: 14 },
  });
};
