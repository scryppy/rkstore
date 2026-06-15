export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function coverImage(p: {
  product_images?: { url: string; is_cover: boolean; position: number }[];
}): string | null {
  const imgs = p.product_images ?? [];
  if (imgs.length === 0) return null;
  const cover = imgs.find((i) => i.is_cover);
  return (cover ?? [...imgs].sort((a, b) => a.position - b.position)[0]).url;
}
