import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

export default function Header({ title, right }: { title: string; right?: React.ReactNode }) {
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <View style={s.row}>
      <Pressable onPress={back} hitSlop={12} style={s.back}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={s.title} numberOfLines={1}>{title}</Text>
      <View style={s.right}>{right}</View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: fonts.heading, fontSize: 26, color: colors.text, marginHorizontal: 12 },
  right: { minWidth: 40, alignItems: 'flex-end' },
});
