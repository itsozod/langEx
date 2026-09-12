import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import type { ChatImageSelection } from '../types/message.types';
import { createGalleryCells } from '../utils/gallery-layout';

type ChatImageConfirmationProps = {
  images: ChatImageSelection[];
  onCancel: () => void;
  onConfirm: () => void;
  onRemove: (index: number) => void;
};

export function ChatImageConfirmation({
  images,
  onCancel,
  onConfirm,
  onRemove,
}: ChatImageConfirmationProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  if (images.length === 0) return null;

  const galleryWidth = screenWidth - 24;
  const galleryHeight = Math.max(
    160,
    Math.min(galleryWidth, screenHeight - insets.top - insets.bottom - 190),
  );
  const cells = createGalleryCells(images.length, galleryWidth, galleryHeight, 3);
  const photoLabel = images.length === 1 ? 'photo' : 'photos';

  return (
    <Modal
      animationType="fade"
      hardwareAccelerated
      onRequestClose={onCancel}
      presentationStyle="fullScreen"
      statusBarTranslucent
      visible>
      <StatusBar style="light" />
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 44) + 8 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel sending photos"
            hitSlop={8}
            onPress={onCancel}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              pointerEvents="none"
              size={20}
              weight="semibold"
              tintColor="#FFFFFF"
            />
          </Pressable>
          <ThemedText style={styles.title}>{`${images.length} selected`}</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.previewArea}>
          <View style={[styles.gallery, { height: galleryHeight, width: galleryWidth }]}>
            {images.map((image, index) => (
              <View key={`${image.uri}-${index}`} style={[styles.cell, cells[index]]}>
                <Image
                  accessibilityLabel={`Selected photo ${index + 1} of ${images.length}`}
                  cachePolicy="memory"
                  contentFit={images.length === 1 ? 'contain' : 'cover'}
                  source={{ uri: image.uri }}
                  style={StyleSheet.absoluteFill}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${index + 1}`}
                  hitSlop={6}
                  onPress={() => onRemove(index)}
                  style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
                  <SymbolView
                    name={{ ios: 'xmark', android: 'close', web: 'close' }}
                    pointerEvents="none"
                    size={15}
                    weight="bold"
                    tintColor="#FFFFFF"
                  />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Send ${images.length} selected ${photoLabel}`}
            onPress={onConfirm}
            style={({ pressed }) => [styles.sendButton, pressed && styles.sendPressed]}>
            <ThemedText type="bold" style={styles.sendLabel}>
              {`Send ${images.length} ${photoLabel}`}
            </ThemedText>
            <SymbolView
              name={{ ios: 'arrow.up', android: 'arrow_upward', web: 'arrow_upward' }}
              pointerEvents="none"
              size={19}
              weight="bold"
              tintColor="#FFFFFF"
            />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050505' },
  header: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(25,25,25,0.8)',
  },
  headerSpacer: { width: 52, height: 52 },
  title: { color: '#FFFFFF', fontSize: 16, lineHeight: 22 },
  previewArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  gallery: {
    overflow: 'hidden',
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: '#111111',
  },
  cell: { position: 'absolute', overflow: 'hidden', backgroundColor: '#161616' },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,15,15,0.78)',
  },
  footer: { alignItems: 'flex-end', paddingHorizontal: 18, paddingTop: 12 },
  sendButton: {
    minWidth: 150,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 20,
    backgroundColor: '#6654C7',
  },
  sendPressed: { backgroundColor: '#5846B5' },
  sendLabel: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
  pressed: { opacity: 0.68 },
});
