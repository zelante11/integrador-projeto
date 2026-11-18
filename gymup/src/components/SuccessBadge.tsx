import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const ring = (size: number, bg: string) => ({
  width: size, height: size, borderRadius: size / 2, backgroundColor: bg,
  alignItems: 'center' as const, justifyContent: 'center' as const,
});

export default function SuccessBadge() {
  return (
    <View style={[ring(130, colors.creamLight), { alignSelf: 'center' }]}>
      <View style={ring(104, colors.cream)}>
        <View style={ring(78, colors.primary)}>
          <Ionicons name="checkmark" size={36} color={colors.white} />
        </View>
      </View>
    </View>
  );
}
