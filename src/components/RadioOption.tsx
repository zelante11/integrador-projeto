import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

type Props = { label: string; on: boolean; onPress: () => void; width?: `${number}%` };

export default function RadioOption({ label, on, onPress, width = '50%' }: Props) {
  return (
    <Pressable onPress={onPress} style={[s.row, { width }]}>
      <View style={s.radio}>{on && <View style={s.dot} />}</View>
      <Text style={s.text}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  text: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.text },
});
