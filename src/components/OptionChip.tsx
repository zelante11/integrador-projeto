import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme';

type Props = { label: string; on: boolean; onPress: () => void };

// Opção selecionável em forma de pílula (nível, frequência etc.).
export default function OptionChip({ label, on, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[s.chip, on && s.on]}>
      <Text style={[s.text, on && s.textOn]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  chip: {
    borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.creamLight,
    paddingHorizontal: 16, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 8,
  },
  on: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text },
  textOn: { fontFamily: fonts.bodyHeavy },
});
