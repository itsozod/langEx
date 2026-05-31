import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import React from 'react';

const Profile = () => {
  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText>Profile</ThemedText>
    </ThemedView>
  );
};

export default Profile;
