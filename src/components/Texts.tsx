import { StyleSheet, Text, TextProps } from 'react-native';
import { colors, fonts } from '../theme';

export const Title = (p: TextProps) => <Text {...p} style={[s.title, p.style]} />;
export const Subtitle = (p: TextProps) => <Text {...p} style={[s.subtitle, p.style]} />;
export const ErrorText = ({ children }: { children?: string | null }) =>
  children ? <Text style={s.error}>{children}</Text> : null;
export const LinkText = (p: TextProps) => <Text {...p} style={[s.link, p.style]} />;

const s = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: 30, color: colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: 'center', marginBottom: 16, lineHeight: 19 },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.error, textAlign: 'center', marginBottom: 16 },
  link: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary },
});
