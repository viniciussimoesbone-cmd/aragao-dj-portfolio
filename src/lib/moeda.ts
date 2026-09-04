/** Arredondamento padrão de valores monetários (2 casas decimais). */
export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}
