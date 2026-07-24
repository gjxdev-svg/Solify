// types/chat.ts
export interface ChatMessage {
  id: number
  chatId: string
  senderUid: string
  text: string
  createdAt: number
  username: string
  avatar: string
}
