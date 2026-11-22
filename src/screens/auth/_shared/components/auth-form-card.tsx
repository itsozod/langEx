import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

/** Groups a form's fields. Deliberately not a card: fields sit directly on the page. */
const AuthFormCard = ({ children }: { children: ReactNode }) => (
  <View style={styles.container}>{children}</View>
);

const styles = StyleSheet.create({
  container: { width: '100%' },
});

export default AuthFormCard;
