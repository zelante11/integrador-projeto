import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../src/components/Header';
import { db } from '../src/services/db';
import { ChatMessage } from '../src/types';
import { colors, fonts } from '../src/theme';

const msg = (role: ChatMessage['role'], text: string): ChatMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role, text, createdAt: new Date().toISOString(),
});

export default function Coach() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    msg('coach', 'Oi! Sou o CoachPro. Posso ajudar com dúvidas sobre cargas, descanso e frequência dos seus treinos. Como posso ajudar?'),
  ]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const list = useRef<FlatList<ChatMessage>>(null);

  async function send() {
    const t = text.trim();
    if (!t || typing) return;
    const history = [...messages, msg('user', t)];
    setMessages(history);
    setText('');
    setTyping(true);
    try {
      const reply = await db.coachReply(history, t);
      setMessages((h) => [...h, msg('coach', reply)]);
    } catch {
      setMessages((h) => [...h, msg('coach', 'Não consegui responder agora. Tente de novo em instantes.')]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <Header title="CoachPro" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          ref={list}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 20, gap: 10 }}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[s.bubble, item.role === 'user' ? s.user : s.coach]}>
              <Text style={[s.text, item.role === 'user' && { color: colors.text }]}>{item.text}</Text>
            </View>
          )}
          ListFooterComponent={typing ? <Text style={s.typing}>CoachPro está digitando...</Text> : null}
        />
        <View style={s.inputBar}>
          <TextInput
            style={s.input} value={text} onChangeText={setText} placeholder="Escreva sua dúvida"
            placeholderTextColor={colors.placeholder} multiline onSubmitEditing={send}
          />
          <Pressable style={[s.send, (!text.trim() || typing) && { opacity: 0.5 }]} onPress={send}>
            <Ionicons name="arrow-up" size={20} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  coach: { alignSelf: 'flex-start', backgroundColor: colors.cream, borderBottomLeftRadius: 4 },
  user: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  text: { fontFamily: fonts.body, fontSize: 14, color: colors.text, lineHeight: 20 },
  typing: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.cream },
  input: {
    flex: 1, maxHeight: 110, minHeight: 44, borderRadius: 22, backgroundColor: colors.creamLight,
    paddingHorizontal: 16, paddingVertical: 10, fontFamily: fonts.body, fontSize: 14, color: colors.text,
  },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
