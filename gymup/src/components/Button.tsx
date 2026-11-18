import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { BUTTON_HEIGHT, colors, fonts, radius } from '../theme';

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  loadingTitle?: string;
  disabled?: boolean;
  pill?: boolean; // botão arredondado e centralizado (login/reset)
};

export default function Button({ title, onPress, loading, loadingTitle, disabled, pill }: Props) {
  const off = disabled && !loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        pill ? styles.pill : styles.full,
        { backgroundColor: off ? colors.disabledBg : pressed || loading ? colors.primaryPressed : colors.primary },
      ]}
    >
      {loading && <ActivityIndicator color={colors.text} style={{ marginRight: 10 }} />}
      <Text style={[styles.text, off && { color: colors.disabledText }]}>
        {loading ? loadingTitle ?? title : title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: BUTTON_HEIGHT, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  full: { alignSelf: 'stretch', borderRadius: radius.button },
  pill: { alignSelf: 'center', borderRadius: 999, paddingHorizontal: 48 },
  text: { fontFamily: fonts.bodyHeavy, fontSize: 16, color: colors.text },
});
