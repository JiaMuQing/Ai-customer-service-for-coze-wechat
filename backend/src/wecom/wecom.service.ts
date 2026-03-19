import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { GroupBindingService } from '../group-binding/group-binding.service';
import { CozeService } from '../coze/coze.service';
import { SessionService } from '../session/session.service';
import { decrypt, getSignature } from './wecom-crypto';

export interface WecomCallbackPayload {
  msgid: string;
  aibotid?: string;
  chatid?: string;
  chattype: 'single' | 'group';
  from: { userid: string };
  response_url: string;
  msgtype: string;
  text?: { content: string };
  quote?: { text?: { content: string }; msgtype?: string };
  stream?: { id?: string };
}

@Injectable()
export class WecomService {
  private readonly token: string;
  private readonly aesKey: string;
  private readonly defaultBotId: string;

  constructor(
    private readonly groupBinding: GroupBindingService,
    private readonly coze: CozeService,
    private readonly session: SessionService,
  ) {
    this.token = process.env.WECOM_BOT_TOKEN ?? '';
    this.aesKey = process.env.WECOM_BOT_AES_KEY ?? '';
    this.defaultBotId = process.env.COZE_BOT_ID ?? '';
  }

  verifyUrl(msgSignature: string, timestamp: string, nonce: string, echostr: string): string | null {
    const sig = getSignature(this.token, timestamp, nonce, echostr);
    if (sig !== msgSignature) return null;
    const corpId = process.env.WECOM_CORP_ID ?? '';
    return decrypt(echostr, this.aesKey, corpId);
  }

  decryptPayload(body: {
    msg_signature: string;
    timestamp: string;
    nonce: string;
    encrypt?: string;
    echostr?: string;
  }): WecomCallbackPayload | null {
    const enc = body.encrypt ?? body.echostr;
    if (!enc) return null;
    const sig = getSignature(this.token, body.timestamp, body.nonce, enc);
    if (sig !== body.msg_signature) return null;
    const corpId = process.env.WECOM_CORP_ID ?? '';
    const raw = decrypt(enc, this.aesKey, corpId);
    try {
      return JSON.parse(raw) as WecomCallbackPayload;
    } catch {
      return null;
    }
  }

  async handleMessage(payload: WecomCallbackPayload): Promise<void> {
    const chatId = payload.chatid ?? payload.from.userid;
    const userId = payload.from.userid;
    const content = this.extractText(payload);
    if (!content?.trim()) return;

    const binding = await this.groupBinding.findByWecomChatId(chatId);
    const botId = binding?.botId ?? this.defaultBotId;

    const cozeConversationId = await this.session.findLastConversationId(chatId, userId);
    const recent = await this.session.getRecentMessages(chatId, userId, 10);
    const additionalMessages = recent
      .reverse()
      .slice(-6)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const result = await this.coze.chat({
      botId,
      userId: `wecom_${chatId}_${userId}`,
      query: content,
      conversationId: cozeConversationId ?? undefined,
      additionalMessages: additionalMessages.length > 0 ? additionalMessages : undefined,
      stream: false,
    });

    const answer = result?.answer ?? '抱歉，暂时无法回复。';
    const newConversationId = result?.conversation_id;

    await this.session.saveMessage({
      wecomChatId: chatId,
      wecomUserId: userId,
      cozeConversationId: newConversationId ?? undefined,
      role: 'user',
      content,
    });
    await this.session.saveMessage({
      wecomChatId: chatId,
      wecomUserId: userId,
      cozeConversationId: newConversationId ?? undefined,
      role: 'assistant',
      content: answer,
    });

    if (payload.response_url) {
      await this.replyToWecom(payload.response_url, answer);
    }
  }

  private extractText(p: WecomCallbackPayload): string {
    if (p.msgtype === 'text' && p.text?.content) return p.text.content;
    if (p.quote?.text?.content) return p.quote.text.content;
    return '';
  }

  private async replyToWecom(responseUrl: string, text: string): Promise<void> {
    try {
      await axios.post(
        responseUrl,
        { msgtype: 'text', text: { content: text } },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 },
      );
    } catch (err) {
      console.error('WeCom reply failed:', err);
    }
  }
}
