import { Text, View } from 'react-native';
import { colors, fonts } from '../theme';

// Logo provisória em texto. Troque por <Image source={require('../../assets/logo.png')} />
export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', alignSelf: 'center' }}>
      <Text style={{ fontFamily: fonts.heading, fontSize: size, color: colors.text }}>Gym</Text>
      <Text style={{ fontFamily: fonts.heading, fontSize: size, color: colors.primary }}>Up</Text>
    </View>
  );
}
