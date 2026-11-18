import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../../src/theme';

const icon = (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, focused }: { color: string; focused: boolean }) => (
    <View style={{
      width: 56, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
      backgroundColor: focused ? colors.cream : 'transparent',
    }}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );

export default function TabsLayout() {
  // A altura considera a área segura (barra de navegação do Android / home indicator do iPhone),
  // senão os ícones ficam cortados ou escondidos.
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.cream,
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 6,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: icon('home-outline') }} />
      <Tabs.Screen name="meta" options={{ title: 'Metas', tabBarIcon: icon('radio-button-on-outline') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icon('person-outline') }} />
    </Tabs>
  );
}
