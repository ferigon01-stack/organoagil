"use client";

import { MapPin } from "lucide-react";

export interface EntregaData {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export const emptyEntrega: EntregaData = {
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
};

const inputCls =
  "w-full rounded-lg border border-input-border bg-input-bg text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-[#b8960c] focus:ring-[#b8960c]";
const labelCls = "mb-1 block text-sm font-medium text-text-primary";

export default function LocalEntregaFields({
  value,
  onChange,
}: {
  value: EntregaData;
  onChange: (v: EntregaData) => void;
}) {
  const set = (k: keyof EntregaData, v: string) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="rounded-xl bg-card-bg p-6 shadow-sm">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-brand-green">
        <MapPin size={18} />
        Local de entrega <span className="text-sm font-normal text-text-muted">(opcional)</span>
      </h2>
      <p className="mb-4 text-xs text-text-muted">
        Preencha apenas se a entrega for em endereço diferente do destinatário.
        Deixe em branco para usar o endereço do cliente. Sai no quadro &quot;Local de
        Entrega&quot; da NFe.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label className={labelCls}>Logradouro</label>
          <input
            type="text"
            value={value.logradouro}
            onChange={(e) => set("logradouro", e.target.value)}
            className={inputCls}
            placeholder="Rua / Avenida"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Número</label>
          <input
            type="text"
            value={value.numero}
            onChange={(e) => set("numero", e.target.value)}
            className={inputCls}
            placeholder="Nº (ou S/N)"
          />
        </div>
        <div className="sm:col-span-3">
          <label className={labelCls}>Complemento</label>
          <input
            type="text"
            value={value.complemento}
            onChange={(e) => set("complemento", e.target.value)}
            className={inputCls}
            placeholder="Bloco, sala, galpão…"
          />
        </div>
        <div className="sm:col-span-3">
          <label className={labelCls}>Bairro</label>
          <input
            type="text"
            value={value.bairro}
            onChange={(e) => set("bairro", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-3">
          <label className={labelCls}>Município</label>
          <input
            type="text"
            value={value.cidade}
            onChange={(e) => set("cidade", e.target.value)}
            className={inputCls}
            placeholder="Cidade"
          />
        </div>
        <div className="sm:col-span-1">
          <label className={labelCls}>UF</label>
          <input
            type="text"
            value={value.estado}
            onChange={(e) => set("estado", e.target.value.toUpperCase().slice(0, 2))}
            className={inputCls}
            placeholder="SP"
            maxLength={2}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>CEP</label>
          <input
            type="text"
            value={value.cep}
            onChange={(e) => set("cep", e.target.value)}
            className={inputCls}
            placeholder="00000-000"
          />
        </div>
      </div>
    </div>
  );
}
