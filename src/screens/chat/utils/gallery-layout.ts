export type GalleryCell = {
  height: number;
  left: number;
  top: number;
  width: number;
};

/** Stable, gap-aware layouts matching common chat gallery patterns for one to four images. */
export function createGalleryCells(
  count: number,
  width: number,
  height: number,
  gap = 2,
): GalleryCell[] {
  if (count <= 1) return [{ height, left: 0, top: 0, width }];

  if (count === 2) {
    const cellWidth = (width - gap) / 2;
    return [
      { height, left: 0, top: 0, width: cellWidth },
      { height, left: cellWidth + gap, top: 0, width: cellWidth },
    ];
  }

  if (count === 3) {
    const rightWidth = Math.floor((width - gap) * 0.4);
    const leftWidth = width - gap - rightWidth;
    const rightHeight = (height - gap) / 2;
    return [
      { height, left: 0, top: 0, width: leftWidth },
      { height: rightHeight, left: leftWidth + gap, top: 0, width: rightWidth },
      {
        height: rightHeight,
        left: leftWidth + gap,
        top: rightHeight + gap,
        width: rightWidth,
      },
    ];
  }

  const cellWidth = (width - gap) / 2;
  const cellHeight = (height - gap) / 2;
  return [0, 1, 2, 3].map((index) => ({
    height: cellHeight,
    left: (index % 2) * (cellWidth + gap),
    top: Math.floor(index / 2) * (cellHeight + gap),
    width: cellWidth,
  }));
}
