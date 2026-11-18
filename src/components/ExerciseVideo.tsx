import { StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors, radius } from '../theme';

// Vídeo demonstrativo do exercício (MP4 do bucket "media"). Toca em loop e sem som.
export default function ExerciseVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return <VideoView player={player} style={s.video} contentFit="contain" nativeControls />;
}

const s = StyleSheet.create({
  video: { width: '100%', aspectRatio: 16 / 9, borderRadius: radius.card, backgroundColor: colors.cream, overflow: 'hidden' },
});
