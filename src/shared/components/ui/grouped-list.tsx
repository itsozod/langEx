import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

import { SymbolView, type SymbolViewProps } from './symbol-view';
import { ThemedText } from './themed-text';

type ListSectionProps = {
  title?: string;
  footer?: string;
  children: ReactNode;
  /** Separator inset: aligns hairlines with the row text when rows have a leading element. */
  inset?: number;
};

/**
 * A grouped list section in the native settings style: one rounded container, rows divided by
 * hairlines, optional caption above and note below. Replaces stacks of floating shadowed cards.
 */
export function ListSection({ title, footer, children, inset = 16 }: ListSectionProps) {
  const tokens = useUiTokens();
  const rows = Children.toArray(children).filter(isValidElement);

  return (
    <View style={styles.section}>
      {title ? (
        <ThemedText style={[styles.caption, { color: tokens.muted }]}>{title}</ThemedText>
      ) : null}
      <View style={[styles.group, { backgroundColor: tokens.card }]}>
        {rows.map((row, index) => (
          <Fragment key={row.key ?? index}>
            {index > 0 ? (
              <View
                style={[styles.separator, { marginLeft: inset, backgroundColor: tokens.hairline }]}
              />
            ) : null}
            {row}
          </Fragment>
        ))}
      </View>
      {footer ? (
        <ThemedText style={[styles.footer, { color: tokens.muted }]}>{footer}</ThemedText>
      ) : null}
    </View>
  );
}

type ListRowProps = {
  title: string;
  subtitle?: string;
  /** Short value shown on the right, e.g. the current language. */
  value?: string;
  icon?: SymbolViewProps['name'];
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  showChevron?: boolean;
  accessibilityHint?: string;
  accessibilityLabel?: string;
};

export function ListRow({
  title,
  subtitle,
  value,
  icon,
  leading,
  trailing,
  onPress,
  destructive = false,
  disabled = false,
  showChevron = Boolean(onPress) && !destructive,
  accessibilityHint,
  accessibilityLabel,
}: ListRowProps) {
  const tokens = useUiTokens();
  const titleColor = destructive ? tokens.danger : tokens.text;

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { disabled } : undefined}
      disabled={!onPress || disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: tokens.fillPressed },
        disabled && styles.disabled,
      ]}>
      {leading}
      {icon ? (
        <View style={[styles.iconTile, { backgroundColor: tokens.fill }]}>
          <SymbolView name={icon} size={17} tintColor={destructive ? tokens.danger : tokens.text} />
        </View>
      ) : null}
      <View style={styles.copy}>
        <ThemedText numberOfLines={1} style={[styles.title, { color: titleColor }]}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText numberOfLines={2} style={[styles.subtitle, { color: tokens.muted }]}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {value ? (
        <ThemedText numberOfLines={1} style={[styles.value, { color: tokens.muted }]}>
          {value}
        </ThemedText>
      ) : null}
      {trailing}
      {showChevron ? (
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={14}
          weight="semibold"
          tintColor={tokens.subtle}
        />
      ) : null}
    </Pressable>
  );
}

/** Separator inset for rows that start with a 30pt icon tile (16 padding + tile + 12 gap). */
export const ICON_ROW_INSET = 58;

const styles = StyleSheet.create({
  section: { gap: 8 },
  caption: {
    paddingHorizontal: 16,
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  group: { borderRadius: 14, borderCurve: 'continuous', overflow: 'hidden' },
  separator: { height: StyleSheet.hairlineWidth },
  footer: { paddingHorizontal: 16, fontSize: 13, lineHeight: 18 },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  disabled: { opacity: 0.45 },
  iconTile: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontFamily: FONT.medium, fontSize: 16, lineHeight: 21 },
  subtitle: { fontSize: 13, lineHeight: 18 },
  value: { maxWidth: '45%', fontSize: 15, lineHeight: 20 },
});
