import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

type Props = TextInputProps & { label: string; password?: boolean; suffix?: string; box?: ViewStyle };

export default function Input({ label, password, suffix, box, ...rest }: Props) {
  const [hidden, setHidden] = useState(!!password);
  return (
    <View style={[{ marginBottom: 20 }, box]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TextInput
          autoCapitalize={password || rest.keyboardType === 'email-address' ? 'none' : 'sentences'}
          {...rest}
          secureTextEntry={hidden}
          placeholderTextColor={colors.placeholder}
          style={styles.input}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
        {password && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.muted, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line },
  input: { flex: 1, height: 44, fontFamily: fonts.body, fontSize: 14, color: colors.text },
  suffix: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.muted, marginLeft: 6 },
});
