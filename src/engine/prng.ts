/**
 * Seeded Mulberry32 PRNG so any Viking life or dynasty seed can be shared and replayed deterministically.
 */

export function hashSeedString(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0 || 123456789;
}

export function nextRandom(state: number): { value: number; nextState: number } {
  let t = (state + 0x6d2b79f5) | 0;
  const nextState = t >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, nextState };
}

export class SeededRNG {
  private state: number;

  constructor(initialState: number) {
    this.state = initialState >>> 0 || 987654321;
  }

  next(): number {
    const res = nextRandom(this.state);
    this.state = res.nextState;
    return res.value;
  }

  int(min: number, max: number): number {
    if (max <= min) return min;
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }

  weightedPick<T extends { weight: number }>(items: readonly T[]): T | null {
    if (items.length === 0) return null;
    const total = items.reduce((sum, item) => sum + Math.max(0.1, item.weight), 0);
    let roll = this.next() * total;
    for (const item of items) {
      roll -= Math.max(0.1, item.weight);
      if (roll <= 0) return item;
    }
    return items[items.length - 1];
  }

  getState(): number {
    return this.state;
  }
}

export function generateReadableSeed(): string {
  const prefixes = ['HRAFN', 'ULFR', 'ELDR', 'ORM', 'RUNE', 'WYRD', 'VALR', 'SKALD'];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${p}-${n}`;
}
