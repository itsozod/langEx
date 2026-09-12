import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import type { MessageImage } from '../types/message.types';

type ChatImageViewerProps = {
  images: MessageImage[];
  initialIndex: number | null;
  onClose: () => void;
};

export function ChatImageViewer({ images, initialIndex, onClose }: ChatImageViewerProps) {
  if (initialIndex === null) return null;
  return <VisibleChatImageViewer images={images} initialIndex={initialIndex} onClose={onClose} />;
}

function VisibleChatImageViewer({
  images,
  initialIndex,
  onClose,
}: Omit<ChatImageViewerProps, 'initialIndex'> & { initialIndex: number }) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  return (
    <Modal
      animationType="fade"
      hardwareAccelerated
      onRequestClose={onClose}
      statusBarTranslucent
      visible>
      <StatusBar style="light" />
      <View style={styles.viewer}>
        <FlatList
          data={images}
          horizontal
          initialScrollIndex={initialIndex}
          keyExtractor={(image, index) => `${image.url}-${index}`}
          getItemLayout={(_, index) => ({ index, length: width, offset: width * index })}
          onMomentumScrollEnd={(event) => {
            setCurrentIndex(Math.round(event.nativeEvent.contentOffset.x / width));
          }}
          pagingEnabled
          removeClippedSubviews
          showsHorizontalScrollIndicator={false}
          windowSize={3}
          renderItem={({ item, index }) => (
            <View style={{ height, width }}>
              <Image
                accessibilityLabel={`Chat photo ${index + 1} of ${images.length}`}
                source={{ uri: item.url }}
                cachePolicy="memory-disk"
                contentFit="contain"
                pointerEvents="none"
                priority={index === currentIndex ? 'high' : 'normal'}
                recyclingKey={`viewer-${item.url}-${index}`}
                style={StyleSheet.absoluteFill}
              />
            </View>
          )}
        />
        <View
          pointerEvents="box-none"
          style={[styles.viewerControls, { paddingTop: Math.max(insets.top, 44) + 8 }]}>
          <View style={styles.controlSpacer} />
          <View style={styles.counterSlot}>
            {images.length > 1 ? (
              <ThemedText
                style={styles.counter}>{`${currentIndex + 1} / ${images.length}`}</ThemedText>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close full-screen photos"
            hitSlop={12}
            onPress={onClose}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              pointerEvents="none"
              size={22}
              weight="semibold"
              tintColor="#FFFFFF"
            />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewer: { flex: 1, backgroundColor: '#050505' },
  viewerControls: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  controlSpacer: { width: 56, height: 56 },
  counterSlot: { minWidth: 56, alignItems: 'center' },
  counter: {
    overflow: 'hidden',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18,
    fontVariant: ['tabular-nums'],
    backgroundColor: 'rgba(25,25,25,0.72)',
  },
  closeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(25,25,25,0.72)',
  },
  pressed: { opacity: 0.68 },
});
