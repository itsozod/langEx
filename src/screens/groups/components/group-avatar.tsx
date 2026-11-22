import { ContactAvatar } from '@/shared/components/ui/contact-avatar';

type GroupAvatarProps = {
  /** Group name; picks the same stable color the group has in the Chats list. */
  name?: string | null;
  size?: 'medium' | 'large';
};

export function GroupAvatar({ name, size = 'medium' }: GroupAvatarProps) {
  return (
    <ContactAvatar name={name?.trim() ?? ''} size={size === 'large' ? 88 : 48} variant="group" />
  );
}
