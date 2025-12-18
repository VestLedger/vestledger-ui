/**
 * Truncate hash with ellipsis
 * @example truncateHash("0x1234567890abcdef") => "0x123456...cdef"
 * @example truncateHash("0x1234567890abcdef", 6, 4) => "0x1234...cdef"
 */
export function truncateHash(hash: string, startLength: number = 10, endLength: number = 8): string {
  if (hash.length <= startLength + endLength) return hash;
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
}
