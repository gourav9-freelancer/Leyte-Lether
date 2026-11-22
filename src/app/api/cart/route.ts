import { buildCartView, currentCartId } from "@/server/cart";
import { handler, jsonOk } from "@/server/http";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  return jsonOk(buildCartView(await currentCartId()));
});
