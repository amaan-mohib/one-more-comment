import { Comment } from '@devvit/web/server';
import { GamePostData } from './types/api';

const STOPWORDS = new Set([
  'i',
  'me',
  'my',
  'you',
  'your',
  'we',
  'they',
  'them',
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'is',
  'are',
  'was',
  'were',
  'to',
  'of',
  'in',
  'on',
  'for',
  'with',
  'how',
  'much',
  'this',
  'that',
  'it',
  'as',
  'at',
  'by',
  'from',
  'be',
  'been',
  'being',
  'if',
  'then',
  'so',
]);

function stripUrls(text: string) {
  return text.replace(/https?:\/\/\S+/g, '');
}

function stripMarkdown(text: string) {
  return text.replace(/[`*_>~#]/g, '');
}

function stripEmojis(text: string) {
  return text.replace(/[\p{Extended_Pictographic}]/gu, '');
}

function normalize(text: string) {
  return stripEmojis(stripMarkdown(stripUrls(text)))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], seed: number) {
  const rng = mulberry32(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function buildTokenRound(raw: string, seed: number) {
  if (!raw) return null;

  const cleaned = normalize(raw);

  // basic junk guards
  if (cleaned.length < 30) return null;
  if (cleaned.includes('[deleted]') || cleaned.includes('[removed]')) return null;

  const tokens = cleaned
    .split(' ')
    .map((t) => t.replace(/[^a-z0-9']/g, ''))
    .filter(Boolean)
    .filter((t) => t.length >= 3)
    .filter((t) => !STOPWORDS.has(t))
    .filter((t) => !/^\d+$/.test(t));

  // remove duplicates but preserve order
  const seen = new Set<string>();
  const unique = tokens.filter((t) => {
    if (seen.has(t)) return false;
    seen.add(t);
    return true;
  });

  if (unique.length !== tokens.length) return null; // has duplicates
  if (unique.length < 4) return null;
  if (unique.length > 12) return null;

  // final safety
  if (unique.some((t) => t.length > 18)) return null;

  const shuffled = shuffle(unique, seed);

  return {
    correctTokens: unique,
    shuffledTokens: shuffled,
  };
}

export const filterComments = (comments: Comment[], seed: number) => {
  const gameData: GamePostData[] = [];

  let i = 0;
  for (let comment of comments) {
    const round = buildTokenRound(comment.body || '', seed + i);
    if (round) {
      gameData.push({
        id: comment.id,
        i,
      });
    }
    if (gameData.length >= 30) break;
    i++;
  }

  return gameData;
};
