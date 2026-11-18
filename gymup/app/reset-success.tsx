import { View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../src/components/Screen';
import Logo from '../src/components/Logo';
import Button from '../src/components/Button';
import SuccessBadge from '../src/components/SuccessBadge';
import { Subtitle, Title } from '../src/components/Texts';

export default function ResetSuccess() {
  return (
    <Screen>
      <View style={{ marginTop: 24 }}><Logo size={34} /></View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <SuccessBadge />
        <Title style={{ marginTop: 40, fontSize: 32 }}>Senha redefinida com sucesso!</Title>
        <Subtitle style={{ marginBottom: 32 }}>
          Sua nova senha já está ativa. Agora você pode acessar sua conta novamente.
        </Subtitle>
        <Button pill title="Voltar para o Login" onPress={() => router.replace('/login')} />
      </View>
    </Screen>
  );
}
