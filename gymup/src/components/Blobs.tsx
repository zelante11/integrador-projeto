import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

// Manchas decorativas dos cantos (aproximação do design).
export default function Blobs({ bottom = true }: { bottom?: boolean }) {
  return (
    <>
      <Svg width={170} height={230} viewBox="0 0 170 230" style={styles.top} pointerEvents="none">
        <Path d="M170 0V150C150 150 120 120 110 80C100 45 70 30 40 20C60 0 120 0 170 0Z" fill={colors.cream} opacity={0.9} />
      </Svg>
      {bottom && (
        <Svg width={150} height={200} viewBox="0 0 150 200" style={styles.bottom} pointerEvents="none">
          <Path d="M0 0C40 20 60 60 90 100C110 130 130 150 150 200H0V0Z" fill={colors.cream} opacity={0.9} />
        </Svg>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, right: 0 },
  bottom: { position: 'absolute', bottom: 0, left: 0 },
});
