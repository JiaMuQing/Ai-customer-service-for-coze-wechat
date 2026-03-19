import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { XMLParser } from 'fast-xml-parser';
import { WecomService } from './wecom.service';

@Controller('wecom')
export class WecomController {
  constructor(private readonly wecom: WecomService) {}

  /**
   * GET: WeCom callback URL verification.
   * 需要你填写：企业微信后台配置的「接收消息」URL 填为 https://你的域名/wecom/callback
   */
  @Get('callback')
  callbackVerify(
    @Query('msg_signature') msgSignature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Query('echostr') echostr: string,
    @Res() res: Response,
  ) {
    const plain = this.wecom.verifyUrl(msgSignature, timestamp, nonce, echostr);
    if (plain == null) {
      res.status(403).send('invalid signature');
      return;
    }
    res.set('Content-Type', 'text/plain').send(plain);
  }

  /**
   * POST: WeCom smart bot receive message (encrypted body).
   * Body format from WeCom: JSON { msg_signature, timestamp, nonce, encrypt } or XML.
   */
  @Post('callback')
  async callbackMessage(
    @Req() req: Request & { rawBody?: Buffer },
    @Res() res: Response,
  ) {
    let body = req.body as Record<string, string> | undefined;
    if (req.rawBody && Buffer.isBuffer(req.rawBody)) {
      const raw = req.rawBody.toString('utf8');
      const trimmed = raw.trim();
      if (trimmed.startsWith('<')) {
        const parser = new XMLParser();
        const parsed = parser.parse(trimmed) as { xml?: Record<string, string> };
        const xml = parsed.xml ?? (parsed as unknown as Record<string, string>);
        body = {
          msg_signature: xml.MsgSignature ?? xml.msg_signature,
          timestamp: xml.TimeStamp ?? xml.timestamp,
          nonce: xml.Nonce ?? xml.nonce,
          encrypt: xml.Encrypt ?? xml.encrypt,
        };
      } else {
        try {
          body = JSON.parse(trimmed) as Record<string, string>;
        } catch {
          body = undefined;
        }
      }
    }
    if (!body) {
      res.status(400).send('bad request');
      return;
    }
    const msgSignature = body.msg_signature ?? body.MsgSignature;
    const timestamp = body.timestamp ?? body.TimeStamp;
    const nonce = body.nonce ?? body.Nonce;
    const encrypt = body.encrypt ?? body.Encrypt;
    if (!msgSignature || !timestamp || !nonce || !encrypt) {
      res.status(400).send('missing params');
      return;
    }
    const payload = this.wecom.decryptPayload({
      msg_signature: msgSignature,
      timestamp,
      nonce,
      encrypt,
    });
    if (!payload) {
      res.status(403).send('decrypt failed');
      return;
    }
    // stream refresh has no response_url, only stream id
    if (payload.msgtype === 'stream' && payload.stream?.id) {
      res.status(200).send('ok');
      return;
    }
    res.status(200).send('ok');
    void this.wecom.handleMessage(payload).catch((e) => console.error('handleMessage error', e));
  }
}
