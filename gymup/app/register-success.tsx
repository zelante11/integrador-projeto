import { Text, View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../src/components/Screen';
import Button from '../src/components/Button';
import SuccessBadge from '../src/components/SuccessBadge';
import { Subtitle, Title } from '../src/components/Texts';
import { colors, fonts } from '../src/theme';

export default function RegisterSuccess() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <SuccessBadge />
        <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: colors.primary, textAlign: 'center', marginTop: 32 }}>
          Tudo certo
        </Text>
        <Title style={{ fontSize: 32 }}>Cadastro realizado!</Title>
        <Subtitle style={{ marginBottom: 40 }}>
          Sua conta GymUp está pronta. Entre agora e comece a acompanhar sua evolução.
        </Subtitle>
        <Button pill title="Voltar para o Login" onPress={() => router.replace('/login')} />
        <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 16 }}>
          Nos vemos no próximo treino.
        </Text>
      </View>
    </Screen>
  );
}
