import 'server-only'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

const key = () => Buffer.from(process.env.MESSAGES_ENCRYPTION_KEY ?? '', 'base64')

export function encrypt(text: string) {
  const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', key(), iv), data = Buffer.concat([c.update(text, 'utf8'), c.final()])
  return ['v1', iv.toString('base64'), c.getAuthTag().toString('base64'), data.toString('base64')].join(':')
}

export function decrypt(value: string) {
  const [, iv, tag, data] = value.split(':'), d = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'))
  d.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([d.update(Buffer.from(data, 'base64')), d.final()]).toString('utf8')
}

export const hash = (value: string) => createHash('sha256').update(value).digest('hex')
