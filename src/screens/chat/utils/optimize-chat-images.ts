import { manipulateAsync, SaveFormat, type Action } from 'expo-image-manipulator';
import type { ImagePickerAsset } from 'expo-image-picker';

const MAX_IMAGE_EDGE = 2048;
const OPTIMIZATION_CONCURRENCY = 2;

async function optimizeImage(asset: ImagePickerAsset): Promise<ImagePickerAsset> {
  try {
    const actions: Action[] = [];
    if (Math.max(asset.width, asset.height) > MAX_IMAGE_EDGE) {
      actions.push({
        resize:
          asset.width >= asset.height ? { width: MAX_IMAGE_EDGE } : { height: MAX_IMAGE_EDGE },
      });
    }
    const result = await manipulateAsync(asset.uri, actions, {
      compress: 0.82,
      format: SaveFormat.JPEG,
    });
    return {
      ...asset,
      ...result,
      fileName: `chat-photo-${Date.now().toString(36)}.jpg`,
      fileSize: undefined,
      mimeType: 'image/jpeg',
    };
  } catch {
    // The backend still validates and normalizes originals if a device codec cannot manipulate one.
    return asset;
  }
}

/** Bounds native decode/encode memory while keeping a four-photo send reasonably quick. */
export async function optimizeChatImages(assets: ImagePickerAsset[]): Promise<ImagePickerAsset[]> {
  const optimized = new Array<ImagePickerAsset>(assets.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < assets.length) {
      const index = nextIndex++;
      optimized[index] = await optimizeImage(assets[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(OPTIMIZATION_CONCURRENCY, assets.length) }, worker),
  );
  return optimized;
}
