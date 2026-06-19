import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const REMETENTE = {
  empresa: "ORGANOAGIL LTDA",
  cnpj: "63.512.791/0001-59",
  cidadeUf: "Araçatuba / SP",
};

const SEFAZ_URL = "https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx";

function formatChave(chave: string) {
  return chave.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatDate(d?: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function NotaPorChavePage({
  params,
}: {
  params: Promise<{ chave: string }>;
}) {
  const { chave } = await params;
  const chaveLimpa = (chave || "").replace(/\D/g, "");

  const pedido =
    chaveLimpa.length === 44
      ? await prisma.pedido.findFirst({
          where: { nfeChave: { endsWith: chaveLimpa } },
          include: { cliente: true },
        })
      : null;

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-800">
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl bg-white shadow-md">
        {/* Cabeçalho */}
        <div
          className="px-6 py-5 text-white"
          style={{ backgroundColor: "#1a4d2e" }}
        >
          <p className="text-sm opacity-80">Nota Fiscal Eletrônica</p>
          <h1 className="text-xl font-bold">Organo Ágil</h1>
        </div>

        {!pedido || !pedido.nfeChave ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-600">
              Nota não encontrada para esta chave.
            </p>
            <p className="mt-2 break-all font-mono text-xs text-gray-400">
              {formatChave(chaveLimpa)}
            </p>
          </div>
        ) : (
          <div className="space-y-5 px-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Nº da NF
                </p>
                <p className="text-lg font-bold">
                  {pedido.nfeNumero ?? "—"}
                  {pedido.nfeSerie ? (
                    <span className="ml-1 text-sm font-normal text-gray-500">
                      / série {pedido.nfeSerie}
                    </span>
                  ) : null}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Emissão
                </p>
                <p className="text-lg font-bold">
                  {formatDate(pedido.nfeDataEmissao)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Chave de acesso
              </p>
              <p className="break-all font-mono text-sm font-medium">
                {formatChave(pedido.nfeChave.replace(/\D/g, ""))}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Remetente
              </p>
              <p className="font-medium">{REMETENTE.empresa}</p>
              <p className="text-sm text-gray-500">
                CNPJ {REMETENTE.cnpj} · {REMETENTE.cidadeUf}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Destinatário
              </p>
              <p className="font-medium">{pedido.cliente.nome}</p>
              <p className="text-sm text-gray-500">
                {pedido.cliente.cnpj || pedido.cliente.cpf || ""}
                {pedido.cliente.cidade
                  ? ` · ${pedido.cliente.cidade}${
                      pedido.cliente.estado ? "/" + pedido.cliente.estado : ""
                    }`
                  : ""}
              </p>
            </div>

            <a
              href={SEFAZ_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl px-4 py-3 text-center text-sm font-semibold text-white"
              style={{ backgroundColor: "#b8960c" }}
            >
              Consultar na SEFAZ
            </a>
            <p className="text-center text-xs text-gray-400">
              No portal da SEFAZ, informe a chave de acesso acima.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
