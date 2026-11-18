import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

type Point = { label: string; value: number };

// Gráfico de barras simples (sem biblioteca). Mostra os últimos 7 treinos.
export default function LoadChart({ data, height = 110 }: { data: Point[]; height?: number }) {
  if (data.length === 0) {
    return (
      <View style={{ marginVertical: 8 }}>
        <View style={s.line} />
        <Text style={s.empty}>Aguardando dados de treino</Text>
        <View style={s.line} />
      </View>
    );
  }
  const points = data.slice(-7);
  const max = Math.max(...points.map((p) => p.value));
  return (
    <View style={{ marginVertical: 8 }}>
      <View style={[s.bars, { height }]}>
        {points.map((p, i) => (
          <View key={i} style={s.col}>
            <Text style={s.value}>{String(p.value).replace('.', ',')}</Text>
            <View style={{
              width: '100%', borderRadius: 6,
              height: Math.max(6, (p.value / max) * (height - 18)),
              backgroundColor: i === points.length - 1 ? colors.primary : colors.line,
            }} />
          </View>
        ))}
      </View>
      <View style={s.labels}>
        {points.map((p, i) => <Text key={i} style={s.label}>{p.label}</Text>)}
      </View>
      <Text style={s.unit}>Maior carga por treino (kg)</Text>
    </View>
  );
}

const s = StyleSheet.create({
  line: { height: 1, backgroundColor: colors.cream },
  empty: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textAlign: 'center', paddingVertical: 14 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  value: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.muted, marginBottom: 2 },
  labels: { flexDirection: 'row', gap: 8, marginTop: 6 },
  label: { flex: 1, textAlign: 'center', fontFamily: fonts.body, fontSize: 9, color: colors.muted },
  unit: { fontFamily: fonts.body, fontSize: 10, color: colors.muted, marginTop: 8, textAlign: 'right' },
});
