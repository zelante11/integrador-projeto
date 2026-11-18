import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import { colors, fonts } from '../theme';

type Props = { error?: string | null; onRetry?: () => void; onLogout?: () => void };

// Tela de carregamento. Com `error`, mostra a mensagem e botões para tentar de novo / sair.
export default function Loading({ error, onRetry, onLogout }: Props) {
  return (
    <View style={s.root}>
      {error ? (
        <>
          <Text style={s.title}>Não foi possível carregar</Text>
          <Text style={s.msg}>{error}</Text>
          {onRetry && <Button pill title="Tentar de novo" onPress={onRetry} />}
          {onLogout && <Text style={s.link} onPress={onLogout}>Sair da conta</Text>}
        </>
      ) : (
        <ActivityIndicator size="large" color={colors.primary} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontFamily: fonts.heading, fontSize: 26, color: colors.text, marginBottom: 8, textAlign: 'center' },
  msg: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: 'center', marginBottom: 24, lineHeight: 19 },
  link: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary, marginTop: 24 },
});
