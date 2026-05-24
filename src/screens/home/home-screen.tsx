import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';

const HomeScreen = () => {
  return (
    <ThemedView style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText>Home screen</ThemedText>
    </ThemedView>
  );
};

export default HomeScreen;
