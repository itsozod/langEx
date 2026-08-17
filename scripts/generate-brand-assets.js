const Jimp = require('jimp-compact');
const { execFileSync } = require('child_process');
const path = require('path');

const root = path.resolve(process.cwd());
const masterPath = path.join(root, 'assets/branding/langex-icon-master-v2.png');
const imageDir = path.join(root, 'assets/images');

function getVisibleBounds(image) {
  let minX = image.bitmap.width;
  let minY = image.bitmap.height;
  let maxX = -1;
  let maxY = -1;

  image.scanQuiet(0, 0, image.bitmap.width, image.bitmap.height, (x, y, index) => {
    if (image.bitmap.data[index + 3] > 12) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  });

  if (maxX < minX || maxY < minY) throw new Error('Brand mark has no visible pixels.');
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function generate() {
  const master = await Jimp.read(masterPath);
  const mark = master.clone();
  mark.scanQuiet(0, 0, mark.bitmap.width, mark.bitmap.height, (_x, _y, index) => {
    const brightness = Math.max(
      mark.bitmap.data[index],
      mark.bitmap.data[index + 1],
      mark.bitmap.data[index + 2],
    );
    const alpha = Math.round(Math.max(0, Math.min(1, (brightness - 105) / 40)) * 255);
    mark.bitmap.data[index + 3] = alpha;
  });
  const bounds = getVisibleBounds(mark);

  execFileSync('/usr/bin/sips', [
    '-z',
    '1024',
    '1024',
    masterPath,
    '--out',
    path.join(imageDir, 'langex-app-icon.png'),
  ]);
  execFileSync('/usr/bin/sips', [
    '-z',
    '64',
    '64',
    masterPath,
    '--out',
    path.join(imageDir, 'langex-favicon.png'),
  ]);

  await mark
    .clone()
    .resize(1024, 1024, Jimp.RESIZE_BICUBIC)
    .writeAsync(path.join(imageDir, 'langex-adaptive-foreground.png'));

  const monochrome = mark.clone();
  monochrome.scanQuiet(0, 0, monochrome.bitmap.width, monochrome.bitmap.height, (_x, _y, index) => {
    monochrome.bitmap.data[index] = 255;
    monochrome.bitmap.data[index + 1] = 255;
    monochrome.bitmap.data[index + 2] = 255;
  });
  await monochrome
    .resize(432, 432, Jimp.RESIZE_BICUBIC)
    .writeAsync(path.join(imageDir, 'langex-adaptive-monochrome.png'));

  const croppedMark = mark.clone().crop(bounds.x, bounds.y, bounds.width, bounds.height);
  const scale = Math.min(520 / croppedMark.bitmap.width, 260 / croppedMark.bitmap.height);
  croppedMark.resize(
    Math.round(croppedMark.bitmap.width * scale),
    Math.round(croppedMark.bitmap.height * scale),
    Jimp.RESIZE_BICUBIC,
  );
  const splash = await Jimp.create(640, 360, 0x00000000);
  splash.composite(
    croppedMark,
    Math.round((splash.bitmap.width - croppedMark.bitmap.width) / 2),
    Math.round((splash.bitmap.height - croppedMark.bitmap.height) / 2),
  );
  await splash.writeAsync(path.join(imageDir, 'langex-splash-mark.png'));

  const cornerAlpha = mark.bitmap.data[3];
  const coverage =
    ((bounds.width * bounds.height) / (mark.bitmap.width * mark.bitmap.height)) * 100;
  console.log(
    `Generated LangEx brand assets. Transparent corner alpha: ${cornerAlpha}. Mark bounds coverage: ${coverage.toFixed(1)}%.`,
  );
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
