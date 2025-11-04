/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// Simple in-memory fallback when Upstash is not configured
const memoryStore = new Map<string, any[]>();

function getKey(source: string, id: string, episode: string | number) {
  return `danmaku:${source}:${id}:${episode}`;
}

function getUpstashClient() {
  const url = process.env.UPSTASH_URL;
  const token = process.env.UPSTASH_TOKEN;
  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source') || '';
    const id = searchParams.get('id') || '';
    const episode = searchParams.get('episode') || '1';
    if (!source || !id) {
      return new Response(JSON.stringify({ error: 'missing source or id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const key = getKey(source, id, episode);
    const client = getUpstashClient();
    if (client) {
      const list = (await client.lrange(key, 0, 200)) || [];
      return new Response(JSON.stringify({ danmuku: list }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      const list = memoryStore.get(key) || [];
      return new Response(JSON.stringify({ danmuku: list.slice(-200).reverse() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source, id, episode = '1', text, color = '#FFFFFF', time, mode = 0, border = true } = body || {};
    if (!source || !id || !text) {
      return new Response(JSON.stringify({ error: 'missing source/id/text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const item = {
      text: String(text),
      color: String(color),
      mode: Number(mode) || 0,
      border: Boolean(border),
      // 如果没提供 time，则由客户端在发送时默认使用当前播放时间
      ...(time !== undefined ? { time: Number(time) } : {}),
    };
    const key = getKey(String(source), String(id), String(episode));
    const client = getUpstashClient();
    if (client) {
      await client.lpush(key, item);
      await client.ltrim(key, 0, 500);
    } else {
      const arr = memoryStore.get(key) || [];
      arr.push(item);
      // 仅保留最近500条
      if (arr.length > 500) arr.splice(0, arr.length - 500);
      memoryStore.set(key, arr);
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}