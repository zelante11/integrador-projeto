import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Screen from '../src/components/Screen';
import Button from '../src/components/Button';
import SuccessBadge from '../src/components/SuccessBadge';
import { Subtitle, Title } from '../src/components/Texts';
import { useAuth } from '../src/state/AuthProvider';
import { colors, fonts } from '../src/theme';

export default function RegisterSuccess() {
  const { confirm } = useLocalSearchParams<{ confirm?: string }>();
  const { session } = useAuth();
  const needsConfirmation = !!confirm && !session;

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <SuccessBadge />
        <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: colors.primary, textAlign: 'center', marginTop: 32 }}>
          Tudo certo
        </Text>
        <Title style={{ fontSize: 32 }}>{needsConfirmation ? 'Confirme seu e-mail' : 'Cadastro realizado!'}</Title>
        <Subtitle style={{ marginBottom: 40 }}>
          {needsConfirmation
            ? 'Enviamos um link de confirmação para o seu e-mail. Depois de confirmar, é só entrar.'
            : 'Sua conta GymUp está pronta. Vamos montar o seu plano de treino.'}
        </Subtitle>
        <Button pill title={session ? 'Continuar' : 'Ir para o Login'}
          onPress={() => router.replace(session ? '/' : '/login')} />
        <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 16 }}>
          Nos vemos no próximo treino.
        </Text>
      </View>
    </Screen>
  );
}
