import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { LANGUAGES } from '@/screens/onboarding/data';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LanguagePickerProps = {
  label: string;
  placeholder: string;
  value: string;
  excludedValue?: string;
  error?: string;
  onChange: (language: string) => void;
};

export function LanguagePicker({
  label,
  placeholder,
  value,
  excludedValue,
  error,
  onChange,
}: LanguagePickerProps) {
  const styles = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filteredLanguages = useMemo(() => {
    const query = search.trim().toLowerCase();
    return LANGUAGES.filter(
      (language) =>
        language !== excludedValue && (!query || language.toLowerCase().includes(query)),
    );
  }, [excludedValue, search]);

  const close = () => {
    setSearch('');
    setIsOpen(false);
  };

  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          error && styles.triggerError,
          pressed && styles.pressed,
        ]}>
        <ThemedText style={[styles.triggerText, !value && styles.placeholder]}>
          {value || placeholder}
        </ThemedText>
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
              {label}
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
              placeholder="Search languages"
              placeholderTextColor={styles.placeholder.color}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.searchInput}
            />
          </View>
          <FlatList
            data={filteredLanguages}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                No languages found.
              </ThemedText>
            }
            renderItem={({ item }) => {
              const selected = item === value;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item);
                    close();
                  }}
                  style={({ pressed }) => [
                    styles.languageRow,
                    selected && styles.languageRowSelected,
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText style={styles.languageText}>{item}</ThemedText>
                  {selected ? (
                    <SymbolView
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      size={18}
                      weight="semibold"
                      tintColor="#6654C7"
                    />
                  ) : null}
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
    field: {
      gap: 7,
    },
    label: {
      color: isDark ? '#D8D0E8' : '#34303D',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    trigger: {
      height: 54,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? '#4A405F' : '#DED8EC',
      backgroundColor: isDark ? '#171321' : '#FBFAFE',
    },
    triggerError: {
      borderColor: '#D64545',
    },
    triggerText: {
      fontSize: 15,
    },
    placeholder: {
      color: isDark ? '#8E849D' : '#91899E',
    },
    icon: {
      color: isDark ? '#A9A0B6' : '#6F6879',
    },
    pressed: {
      opacity: 0.65,
    },
    error: {
      color: isDark ? '#FF9A9A' : '#B42318',
      fontSize: 12,
      lineHeight: 17,
    },
    modalSafeArea: {
      flex: 1,
      backgroundColor: isDark ? '#15111F' : '#FCFBFF',
    },
    modalHeader: {
      minHeight: 56,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? '#3A3347' : '#E4DFEC',
    },
    modalTitle: {
      fontSize: 16,
    },
    done: {
      color: isDark ? '#BFB1FF' : '#5B49B8',
      fontSize: 14,
      fontWeight: '700',
    },
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
    searchInput: {
      flex: 1,
      height: '100%',
      color: isDark ? '#F5F1FF' : '#221E2B',
      fontSize: 15,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    languageRow: {
      minHeight: 50,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 12,
    },
    languageRowSelected: {
      backgroundColor: isDark ? 'rgba(102, 84, 199, 0.18)' : 'rgba(102, 84, 199, 0.09)',
    },
    languageText: {
      fontSize: 15,
    },
    emptyText: {
      paddingVertical: 40,
      textAlign: 'center',
      fontSize: 14,
    },
  });
};
