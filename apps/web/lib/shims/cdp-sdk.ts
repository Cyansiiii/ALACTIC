// Stub for @coinbase/cdp-sdk. It is pulled in only by the Node build of
// @base-org/account (wagmi baseAccount connector) for server-side subscription
// payments, which ALACTIC never uses. Throws loudly if anything ever calls it.
export class CdpClient {
  constructor() {
    throw new Error("@coinbase/cdp-sdk is stubbed in ALACTIC (lib/shims/cdp-sdk.ts)");
  }
}
