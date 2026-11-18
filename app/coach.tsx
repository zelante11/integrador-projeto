import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../src/components/Header';
import Loading from '../src/components/Loading';
import { db } from '../src/services/db';
import { ChatMessage } from '../src/types';
import { COACH_GREETING, coachReply } from '../src/utils/coach';
import { useAsync } from '../src/utils/useAsync';
import { colors, fonts } from '../src/theme';

const msg = (role: ChatMessage['role'], text: string): ChatMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role, text, createdAt: new Date().toISOString(),
});

export default function Coach() {
  const chat = useAsync(() => db.getChat(), []);
  const [fresh, setFresh] = useState<ChatMessage[]>([]); // mensagens desta sessão
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const list = useRef<FlatList<ChatMessage>>(null);

  if (chat.error || !chat.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
        <Header title="CoachPro" />
        <Loading error={chat.error} onRetry={chat.reload} />
      </SafeAreaView>
    );
  }

  const { conversationId } = chat.data;
  const saved = [...chat.data.messages, ...fresh];
  const messages = saved.length === 0 ? [msg('assistant', COACH_GREETING)] : saved;

  async function send() {
    const t = text.trim();
    if (!t || typing) return;
    setFresh((h) => [...h, msg('user', t)]);
    setText('');
    setTyping(true);
    try {
      await db.addChatMessage(conversationId, 'user', t);
      const reply = await coachReply(t);
      const answer = await db.addChatMessage(conversationId, 'assistant', reply);
      setFresh((h) => [...h, answer]);
    } catch {
      setFresh((h) => [...h, msg('assistant', 'Não consegui responder agora. Tente de novo em instantes.')]);
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
              <Text style={s.text}>{item.text}</Text>
            </View>
          )}
          ListFooterComponent={typing ? <Text style={s.typing}>CoachPro está digitando...</Text> : undefined}
        />
        <View style={s.inputBar}>
          <TextInput
            style={s.input} value={text} onChangeText={setText} placeholder="Escreva sua dúvida"
            placeholderTextColor={colors.placeholder} multiline
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
