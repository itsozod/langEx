import { View } from 'react-native';

import { SymbolView } from '@/shared/components/ui/symbol-view';

import { useGroupStyles } from '../styles/group-styles';

type GroupAvatarProps = {
  size?: 'medium' | 'large';
};

export function GroupAvatar({ size = 'medium' }: GroupAvatarProps) {
  const styles = useGroupStyles();
  const isLarge = size === 'large';

  return (
    <View style={isLarge ? styles.groupAvatarLarge : styles.groupAvatar}>
      <SymbolView
        name={{ ios: 'person.3.fill', android: 'group', web: 'group' }}
        size={isLarge ? 31 : 22}
        weight="semibold"
        tintColor={styles.groupAvatarIcon.color}
      />
    </View>
  );
}
