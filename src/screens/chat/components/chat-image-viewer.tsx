import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Zoom from 'react-native-zoom-reanimated';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatImageDismiss } from '../hooks/use-chat-image-dismiss';
import type { MessageImage } from '../types/message.types';

type ChatImageViewerProps = {
  images: MessageImage[];
  initialIndex: number | null;
  onClose: () => void;
};

type ZoomableChatImageProps = {
  height: number;
  image: MessageImage;
  index: number;
  isActive: boolean;
  imageCount: number;
  onZoomStateChange: (zoomed: boolean) => void;
  width: number;
};

const DOUBLE_TAP_CONFIG = { defaultScale: 2.5 } as const;

export function ChatImageViewer({ images, initialIndex, onClose }: ChatImageViewerProps) {
  if (initialIndex === null) return null;
  return <VisibleChatImageViewer images={images} initialIndex={initialIndex} onClose={onClose} />;
}

function ZoomableChatImage({
  height,
  image,
  index,
  isActive,
  imageCount,
  onZoomStateChange,
  width,
}: ZoomableChatImageProps) {
  const imageScale = Math.min(width / Math.max(image.width, 1), height / Math.max(image.height, 1));
  const containedImageSize = {
    height: Math.max(image.height, 1) * imageScale,
    width: Math.max(image.width, 1) * imageScale,
  };

  return (
    <Zoom doubleTapConfig={DOUBLE_TAP_CONFIG} maxScale={5} onZoomStateChange={onZoomStateChange}>
      <Image
        accessibilityHint="Pinch or double-tap to zoom"
        accessibilityLabel={`Chat photo ${index + 1} of ${imageCount}`}
        source={{ uri: image.url }}
        cachePolicy="memory-disk"
        contentFit="contain"
        priority={isActive ? 'high' : 'normal'}
        recyclingKey={`viewer-${image.url}-${index}`}
        style={containedImageSize}
      />
    </Zoom>
  );
}

function VisibleChatImageViewer({
  images,
  initialIndex,
  onClose,
}: Omit<ChatImageViewerProps, 'initialIndex'> & { initialIndex: number }) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const { backdropStyle, contentStyle, dismissGesture } = useChatImageDismiss({
    height,
    isEnabled: !isZoomed,
    onClose,
  });

  const handleZoomStateChange = useCallback(
    (index: number, zoomed: boolean) => {
      if (index === currentIndex) setIsZoomed(zoomed);
    },
    [currentIndex],
  );

  return (
    <Modal
      animationType="fade"
      hardwareAccelerated
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible>
      <StatusBar style="light" />
      <GestureHandlerRootView style={styles.modalRoot}>
        <Animated.View pointerEvents="none" style={[styles.backdrop, backdropStyle]} />
        <GestureDetector gesture={dismissGesture}>
          <Animated.View onAccessibilityEscape={onClose} style={[styles.viewer, contentStyle]}>
            <FlatList
              data={images}
              horizontal
              initialScrollIndex={initialIndex}
              keyExtractor={(image, index) => `${image.url}-${index}`}
              getItemLayout={(_, index) => ({ index, length: width, offset: width * index })}
              onMomentumScrollEnd={(event) => {
                setCurrentIndex(Math.round(event.nativeEvent.contentOffset.x / width));
                setIsZoomed(false);
              }}
              pagingEnabled
              removeClippedSubviews
              scrollEnabled={!isZoomed}
              showsHorizontalScrollIndicator={false}
              windowSize={3}
              renderItem={({ item, index }) => (
                <View style={{ height, width }}>
                  <ZoomableChatImage
                    height={height}
                    image={item}
                    imageCount={images.length}
                    index={index}
                    isActive={index === currentIndex}
                    onZoomStateChange={(zoomed) => handleZoomStateChange(index, zoomed)}
                    width={width}
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
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#050505',
  },
  viewer: { flex: 1 },
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
