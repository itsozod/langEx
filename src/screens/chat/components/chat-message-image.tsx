import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import type { GiftedMessage, MessageImage } from '../types/message.types';
import { createGalleryCells } from '../utils/gallery-layout';
import { ChatImageViewer } from './chat-image-viewer';

type ChatMessageImageProps = {
  images: MessageImage[];
  message: GiftedMessage;
  onLongPress: () => void;
};

export function ChatMessageImage({ images, message, onLongPress }: ChatMessageImageProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const galleryWidth = Math.min(270, screenWidth * 0.7);
  const firstImage = images[0];
  const galleryHeight =
    images.length === 1
      ? Math.min(
          320,
          Math.max(150, galleryWidth * (firstImage.height / Math.max(firstImage.width, 1))),
        )
      : images.length === 2
        ? galleryWidth * 0.78
        : galleryWidth;
  const cells = createGalleryCells(images.length, galleryWidth, galleryHeight);

  return (
    <>
      <View
        accessibilityRole="image"
        style={[styles.gallery, { height: galleryHeight, width: galleryWidth }]}>
        {images.map((image, index) => (
          <Pressable
            key={`${image.url}-${index}`}
            accessibilityRole="imagebutton"
            accessibilityLabel={`Open photo ${index + 1} of ${images.length} full screen`}
            onLongPress={onLongPress}
            onPress={() => setViewerIndex(index)}
            style={({ pressed }) => [styles.cell, cells[index], pressed && styles.pressed]}>
            <Image
              source={{ uri: image.thumbnailUrl }}
              cachePolicy="memory-disk"
              contentFit="cover"
              recyclingKey={`${String(message._id)}-${index}`}
              transition={message.pending ? 0 : 150}
              style={StyleSheet.absoluteFill}
            />
          </Pressable>
        ))}
        {message.deliveryStatus === 'sending' ? (
          <View style={styles.uploading} pointerEvents="none">
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : null}
      </View>
      <ChatImageViewer
        images={images}
        initialIndex={viewerIndex}
        onClose={() => setViewerIndex(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  gallery: {
    overflow: 'hidden',
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  cell: { position: 'absolute', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.1)' },
  uploading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12,8,20,0.32)',
  },
  pressed: { opacity: 0.82 },
});
