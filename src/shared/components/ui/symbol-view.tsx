import { SymbolView as ExpoSymbolView, type SymbolViewProps } from 'expo-symbols';
import {
  ArrowUp,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleUserRound,
  Compass,
  Contrast,
  Copy,
  Eye,
  EyeOff,
  Globe,
  History,
  Link,
  Trash2,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  Pencil,
  Reply,
  Search,
  Sun,
  User,
  UserRoundX,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { Platform, StyleSheet, View } from 'react-native';

export type { SymbolViewProps } from 'expo-symbols';

const androidIcons: Record<string, LucideIcon> = {
  account_circle: CircleUserRound,
  arrow_drop_down: ChevronDown,
  arrow_upward: ArrowUp,
  chat: MessageCircle,
  chat_bubble_outline: MessageCircle,
  check: Check,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  close: X,
  content_copy: Copy,
  contrast: Contrast,
  delete: Trash2,
  dark_mode: Moon,
  edit: Pencil,
  error: CircleAlert,
  explore: Compass,
  history: History,
  light_mode: Sun,
  link: Link,
  lock: Lock,
  logout: LogOut,
  mail: Mail,
  person: User,
  person_off: UserRoundX,
  photo_camera: Camera,
  public: Globe,
  reply: Reply,
  search: Search,
  visibility: Eye,
  visibility_off: EyeOff,
  wifi_off: WifiOff,
};

const getStrokeWidth = (weight: SymbolViewProps['weight']) => {
  const resolvedWeight = typeof weight === 'string' ? weight : weight?.ios;

  switch (resolvedWeight) {
    case 'black':
    case 'heavy':
    case 'bold':
      return 2.75;
    case 'semibold':
      return 2.5;
    case 'medium':
      return 2.25;
    case 'light':
      return 1.75;
    case 'thin':
      return 1.5;
    case 'ultraLight':
      return 1.25;
    default:
      return 2;
  }
};

/**
 * Uses native SF Symbols on iOS and SVG paths on Android.
 *
 * Expo Symbols renders Android Material Symbols as text. Android font metrics
 * add glyph-specific baseline space, so icons can look off-center even inside
 * a perfectly centered button. SVG paths have a fixed view box and stay
 * centered consistently across devices, font scales, and Android versions.
 */
export function SymbolView(props: SymbolViewProps) {
  if (Platform.OS !== 'android') {
    return <ExpoSymbolView {...props} />;
  }

  const {
    animationSpec: _animationSpec,
    colors: _colors,
    fallback,
    name,
    resizeMode: _resizeMode,
    scale: _scale,
    size = 24,
    style,
    tintColor,
    type: _type,
    weight,
    ...viewProps
  } = props;
  const androidName = typeof name === 'object' ? name.android : undefined;
  const AndroidIcon = androidName ? androidIcons[androidName] : undefined;

  return (
    <View
      {...viewProps}
      style={[styles.iconBox, { width: size, height: size }, style]}
      pointerEvents="none">
      {AndroidIcon ? (
        <AndroidIcon color={tintColor} size={size} strokeWidth={getStrokeWidth(weight)} />
      ) : (
        fallback
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
