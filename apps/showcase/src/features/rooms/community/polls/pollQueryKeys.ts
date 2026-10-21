export function getPollListKey(roomId: string) {
  return ['rooms', roomId, 'polls', 'list'] as const;
}

export function getPollKey(roomId: string, pollId: string) {
  return ['rooms', roomId, 'polls', 'detail', pollId] as const;
}
