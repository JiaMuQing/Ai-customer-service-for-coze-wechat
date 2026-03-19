import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface CozeChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CozeChatOptions {
  botId: string;
  userId: string;
  query: string;
  conversationId?: string;
  additionalMessages?: CozeChatMessage[];
  stream?: boolean;
}

export interface CozeChatResponse {
  code: number;
  msg?: string;
  data?: {
    id: string;
    conversation_id: string;
    answer: string;
    message_id?: string;
  };
}

@Injectable()
export class CozeService {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.COZE_API_BASE ?? 'https://api.coze.cn';
    const pat = process.env.COZE_PAT ?? '';
    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${pat}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async chat(options: CozeChatOptions): Promise<CozeChatResponse['data']> {
    const {
      botId,
      userId,
      query,
      conversationId,
      additionalMessages,
      stream = false,
    } = options;
    const body: Record<string, unknown> = {
      bot_id: botId,
      user_id: userId,
      query,
      stream,
    };
    if (conversationId) body.conversation_id = conversationId;
    if (additionalMessages?.length)
      body.additional_messages = additionalMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const { data } = await this.client.post<CozeChatResponse>('/v3/chat', body);
    if (data.code !== 0) {
      throw new Error(data.msg ?? `Coze API error: ${data.code}`);
    }
    return data.data ?? undefined;
  }

  getDefaultBotId(): string {
    const id = process.env.COZE_BOT_ID;
    if (!id) throw new Error('COZE_BOT_ID is not set in .env');
    return id;
  }
}
