import fs from "node:fs";
import vm from "node:vm";

const htmlPath = new URL("../public/tools/txline-subscribe/index.html", import.meta.url);
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script type="module">([\s\S]*?)<\/script>/);

if (!match) {
  throw new Error("No module script found in TxLINE subscribe helper.");
}

const script = match[1];

class FakeElement {
  constructor(id, { value = "", textContent = "", disabled = false } = {}) {
    this.id = id;
    this.value = value;
    this.textContent = textContent;
    this.disabled = disabled;
    this.className = "";
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    const list = this.listeners.get(type) || [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  async click() {
    for (const listener of this.listeners.get("click") || []) {
      await listener({ target: this });
    }
  }
}

function createPublicKeyClass() {
  return class PublicKey {
    constructor(value) {
      this.value = String(value);
    }

    toBase58() {
      return this.value;
    }

    toString() {
      return this.value;
    }

    static findProgramAddressSync(seeds, programId) {
      const seedLabel = seeds
        .map((seed) => Array.from(seed).map((byte) => String.fromCharCode(byte)).join(""))
        .join("-");
      return [new this(`PDA_${seedLabel}_${programId.toBase58().slice(0, 6)}`), 255];
    }
  };
}

async function createImportHandler(PublicKey, calls, context) {
  const makeEvaluatedModule = async (exports) => {
    const module = new vm.SyntheticModule(
      Object.keys(exports),
      function setExports() {
        for (const [key, value] of Object.entries(exports)) {
          this.setExport(key, value);
        }
      },
      { context }
    );
    await module.link(() => {});
    await module.evaluate();
    return module;
  };

  const web3Module = await makeEvaluatedModule({
    PublicKey,
    SystemProgram: { programId: new PublicKey("11111111111111111111111111111111") },
    TransactionInstruction: class TransactionInstruction {
      constructor(params) {
        Object.assign(this, params);
      }
    },
    Transaction: class Transaction {
      constructor() {
        this.instructions = [];
      }

      add(instruction) {
        this.instructions.push(instruction);
        return this;
      }

      serialize() {
        return Buffer.from("signed-mock-transaction");
      }
    },
    Connection: class Connection {
      constructor(rpcUrl, commitment) {
        this.rpcUrl = rpcUrl;
        this.commitment = commitment;
      }

      async getAccountInfo() {
        calls.accountInfo += 1;
        return null;
      }

      async getBalance() {
        calls.balance += 1;
        return 8_070_000;
      }

      async getLatestBlockhash() {
        calls.blockhash += 1;
        return { blockhash: "MOCK_BLOCKHASH", lastValidBlockHeight: 12345 };
      }

      async simulateTransaction() {
        calls.simulate += 1;
        return { value: { err: null, logs: ["mock simulation ok"] } };
      }

      async sendRawTransaction() {
        calls.send += 1;
        return "MOCK_TX_SIG_123456789";
      }

      async confirmTransaction() {
        calls.confirm += 1;
        return { value: { err: null } };
      }
    }
  });

  const splModule = await makeEvaluatedModule({
    TOKEN_2022_PROGRAM_ID: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFykMdyNm3N2ZLJ7K1"),
    ASSOCIATED_TOKEN_PROGRAM_ID: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
    getAssociatedTokenAddressSync(mint, owner) {
      return new PublicKey(`ATA_${mint.toBase58().slice(0, 6)}_${owner.toBase58().slice(0, 6)}`);
    },
    createAssociatedTokenAccountInstruction(...args) {
      calls.ata += 1;
      return { kind: "createAssociatedTokenAccount", args };
    }
  });

  return async (specifier) => {
    if (String(specifier).includes("@solana/web3.js")) return web3Module;
    if (String(specifier).includes("@solana/spl-token")) return splModule;
    throw new Error(`Unexpected dynamic import: ${specifier}`);
  };
}

function createDom({ wallet }) {
  const elements = new Map();
  const initial = {
    network: { value: "devnet" },
    serviceLevel: { value: "1" },
    durationWeeks: { value: "4" },
    rpcUrl: { value: "" },
    hostMetric: { textContent: "Checking..." },
    walletMetric: { textContent: "Not checked" },
    idlMetric: { textContent: "Not prepared" },
    balanceMetric: { textContent: "Not checked" },
    balanceHint: { textContent: "Connect a wallet to check both networks." },
    networkStatus: { textContent: "Not checked" },
    walletStatus: { textContent: "Not connected" },
    programStatus: { textContent: "Not prepared" },
    txStatus: { textContent: "Not submitted" },
    result: { textContent: "" },
    preflight: {},
    wallet: {},
    refreshBalance: {},
    loadIdl: {},
    subscribe: {},
    copyTx: { disabled: true },
    openActivation: { disabled: true },
    copyDiagnostics: {}
  };

  for (const [id, params] of Object.entries(initial)) {
    elements.set(id, new FakeElement(id, params));
  }

  return {
    elements,
    document: {
      getElementById(id) {
        return elements.get(id) || null;
      }
    },
    location: {
      href: "https://example.test/tools/txline-subscribe/index.html",
      protocol: "https:",
      hostname: "example.test"
    },
    navigator: {
      clipboard: {
        text: "",
        async writeText(value) {
          this.text = value;
        }
      }
    },
    wallet
  };
}

async function runScenario({ withWallet }) {
  const PublicKey = createPublicKeyClass();
  const calls = { accountInfo: 0, ata: 0, balance: 0, blockhash: 0, simulate: 0, send: 0, confirm: 0, sign: 0 };
  const wallet = withWallet
    ? {
        isPhantom: true,
        publicKey: null,
        async connect() {
          this.publicKey = new PublicKey("MockWallet111111111111111111111111111111111");
          return { publicKey: this.publicKey };
        },
        async signTransaction(transaction) {
          calls.sign += 1;
          return transaction;
        }
      }
    : null;

  const dom = createDom({ wallet });
  const sandbox = {
    Buffer,
    TextEncoder,
    URL,
    console,
    document: dom.document,
    location: dom.location,
    navigator: dom.navigator,
    window: wallet ? { phantom: { solana: wallet }, solana: wallet } : {},
    setTimeout,
    clearTimeout
  };

  const context = vm.createContext(sandbox);
  const importModuleDynamically = await createImportHandler(PublicKey, calls, context);
  const module = new vm.SourceTextModule(script, {
    context,
    identifier: "txline-subscribe-helper.mjs",
    importModuleDynamically
  });

  await module.link(() => {});
  await module.evaluate();

  const el = (id) => dom.elements.get(id);

  if (!withWallet) {
    return {
      host: el("hostMetric").textContent,
      wallet: el("walletMetric").textContent,
      instruction: el("idlMetric").textContent,
      network: el("networkStatus").textContent,
      serviceLevel: el("serviceLevel").value,
      result: el("result").textContent
    };
  }

  await el("preflight").click();
  await el("wallet").click();
  await el("loadIdl").click();
  await el("subscribe").click();

  return {
    wallet: el("walletStatus").textContent,
    instruction: el("programStatus").textContent,
    balance: el("balanceMetric").textContent,
    serviceLevel: el("serviceLevel").value,
    tx: el("txStatus").textContent,
    copyEnabled: !el("copyTx").disabled,
    openEnabled: !el("openActivation").disabled,
    calls,
    result: el("result").textContent
  };
}

const noWallet = await runScenario({ withWallet: false });
if (
  noWallet.host !== "安全" ||
  noWallet.wallet !== "未检测到钱包" ||
  noWallet.instruction !== "未准备" ||
  noWallet.network !== "就绪" ||
  noWallet.serviceLevel !== "1"
) {
  throw new Error(`No-wallet scenario failed: ${JSON.stringify(noWallet, null, 2)}`);
}

const walletFlow = await runScenario({ withWallet: true });
if (
  walletFlow.tx !== "MOCK_TX_SIG_123456789" ||
  !walletFlow.copyEnabled ||
  !walletFlow.openEnabled ||
  walletFlow.calls.sign !== 1 ||
  walletFlow.calls.accountInfo !== 2 ||
  walletFlow.calls.ata !== 2 ||
  walletFlow.calls.simulate !== 0 ||
  walletFlow.calls.send !== 1 ||
  walletFlow.calls.confirm !== 1 ||
  !walletFlow.instruction.startsWith("已准备:") ||
  walletFlow.serviceLevel !== "1" ||
  walletFlow.balance.includes("建议")
) {
  throw new Error(`Wallet scenario failed: ${JSON.stringify(walletFlow, null, 2)}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      noWallet,
      walletFlow
    },
    null,
    2
  )
);
