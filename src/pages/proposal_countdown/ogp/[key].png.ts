/**
 * シェア用の OGP 画像 (/proposal_countdown/ogp/7.png など)。ビルド時に生成する。
 */
import type { APIRoute } from 'astro';
import { renderShareOgp, shareKeys } from '../../../lib/proposal-ogp';

export function getStaticPaths() {
  return shareKeys().map((key) => ({ params: { key } }));
}

export const GET: APIRoute = async ({ params }) => {
  const png = await renderShareOgp(params.key!);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
