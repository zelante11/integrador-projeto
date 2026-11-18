import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export default function Chip({ label }: { label: string }) {
  return (
    <View style={s.chip}>
      <Text style={s.text}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  chip: { backgroundColor: colors.cream, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  text: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.text },
});
