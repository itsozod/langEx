import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

/** Stacks a step's fields and Next button directly on the page — no card around them. */
export function OnboardingCard({ children }: { children: ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 20 },
});
