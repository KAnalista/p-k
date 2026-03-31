import { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Copy, Check, FileText, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TipoVenta = "COMPLETA" | "FRACCIONADA";

interface FormData {
  nombre: string;
  telefono: string;
  dni: string;
  correo: string;
  curso: string;
  asesor: string;
  estadoVentaCompleta: string;
  fechaVentaCompleta: string;
  montoVentaCompleta: string;
  fecha1erPago: string;
  monto1erPago: string;
  estado2doPago: string;
  fecha2doPago: string;
  monto2doPago: string;
}

const initialForm: FormData = {
  nombre: "",
  telefono: "",
  dni: "",
  correo: "",
  curso: "",
  asesor: "",
  estadoVentaCompleta: "PAGO",
  fechaVentaCompleta: "",
  montoVentaCompleta: "S/ 0.00",
  fecha1erPago: "",
  monto1erPago: "S/ 0.00",
  estado2doPago: "DEBE",
  fecha2doPago: "",
  monto2doPago: "S/ 0.00",
};
function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}/${year}`;
}

function formatMessage(data: FormData, tipo: TipoVenta): string {
  const lines: string[] = [];

  if (data.nombre) lines.push(`👤 *Nombre:* ${data.nombre}`);
  if (data.telefono) lines.push(`📱 *Teléfono:* ${data.telefono}`);
  if (data.dni) lines.push(`🪪 *DNI/CE:* ${data.dni}`);
  if (data.correo) lines.push(`📧 *Correo:* ${data.correo}`);
  if (data.curso) lines.push(`📚 *Curso:* ${data.curso}`);
  if (data.asesor) lines.push(`🧑‍💼 *Asesor:* *${data.asesor}*`);
  lines.push(`📋 *Tipo Venta:* ${tipo}`);

  if (tipo === "COMPLETA") {
    lines.push(`✅ *Estado Venta Completa:* PAGO`);
    if (data.fechaVentaCompleta) lines.push(`📅 *Fecha Venta Completa:* ${formatDateDisplay(data.fechaVentaCompleta)}`);
    if (data.montoVentaCompleta) lines.push(`💰 *Monto Venta Completa:* ${data.montoVentaCompleta}`);
  } else {
    lines.push("");
    lines.push("📌 *Este es el monto del primer pago:*");
    lines.push("");
    lines.push(`✅ *Estado 1er Pago:* PAGO`);
    if (data.fecha1erPago) lines.push(`📅 *Fecha 1er Pago:* ${formatDateDisplay(data.fecha1erPago)}`);
    if (data.monto1erPago) lines.push(`💰 *Monto 1er Pago:* ${data.monto1erPago}`);
    lines.push("");
    if (data.estado2doPago) lines.push(`✅ *Estado 2do Pago:* ${data.estado2doPago}`);
    if (data.fecha2doPago) lines.push(`📅 *Fecha 2do Pago:* ${formatDateDisplay(data.fecha2doPago)}`);
    if (data.monto2doPago) lines.push(`💰 *Monto 2do Pago:* ${data.monto2doPago}`);
    lines.push("");
    lines.push("⚠️ *No se olvide la siguiente fecha de pago.*");
  }

  return lines.join("\n");
}

interface FieldRowProps {
  label: string;
  emoji: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function FieldRow({ label, emoji, value, onChange, placeholder }: FieldRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg shrink-0">{emoji}</span>
      <label className="text-sm font-medium text-foreground w-36 shrink-0">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="text-sm"
      />
    </div>
  );
}

export default function ManualEntry() {
  const [tipo, setTipo] = useState<TipoVenta>("COMPLETA");
  const [form, setForm] = useState<FormData>(initialForm);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const update = useCallback((key: keyof FormData, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const formatted = formatMessage(form, tipo);
  const hasContent = form.nombre || form.telefono || form.dni;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    toast({ title: "¡Copiado!", description: "Mensaje listo para pegar en WhatsApp." });
    setTimeout(() => setCopied(false), 2000);
  }, [formatted, toast]);

  const handleClear = useCallback(() => {
    setForm(initialForm);
    setCopied(false);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* Tipo de venta buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setTipo("COMPLETA")}
            variant={tipo === "COMPLETA" ? "default" : "outline"}
            className={`flex-1 gap-2 h-14 text-base font-semibold transition-all ${
              tipo === "COMPLETA"
                ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                : "hover:bg-accent"
            }`}
          >
            <FileText className="w-5 h-5" />
            COMPLETA
          </Button>
          <Button
            onClick={() => setTipo("FRACCIONADA")}
            variant={tipo === "FRACCIONADA" ? "default" : "outline"}
            className={`flex-1 gap-2 h-14 text-base font-semibold transition-all ${
              tipo === "FRACCIONADA"
                ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                : "hover:bg-accent"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            FRACCIONADA
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Left: Form */}
          <div className="flex-1 space-y-4">
            <Card className="p-4 space-y-3">
              <span className="text-sm font-semibold text-foreground">Datos del Cliente</span>
              <FieldRow emoji="👤" label="Nombre" value={form.nombre} onChange={(v) => update("nombre", v)} />
              <FieldRow emoji="📱" label="Teléfono" value={form.telefono} onChange={(v) => update("telefono", v)} />
              <FieldRow emoji="🪪" label="DNI" value={form.dni} onChange={(v) => update("dni", v)} />
              <FieldRow emoji="📧" label="Correo" value={form.correo} onChange={(v) => update("correo", v)} />
              <FieldRow emoji="📚" label="Curso" value={form.curso} onChange={(v) => update("curso", v)} />
              <FieldRow emoji="🧑‍💼" label="Asesor" value={form.asesor} onChange={(v) => update("asesor", v)} />
            </Card>

            {tipo === "COMPLETA" && (
              <Card className="p-4 space-y-3 border-primary/30">
                <span className="text-sm font-semibold text-foreground">Venta Completa</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg shrink-0">✅</span>
                  <label className="text-sm font-medium text-foreground w-36 shrink-0">Estado</label>
                  <span className="text-sm font-semibold text-primary">PAGO</span>
                </div>
                <FieldRow emoji="📅" label="Fecha" value={form.fechaVentaCompleta} onChange={(v) => update("fechaVentaCompleta", v)} placeholder="31/3/2026" />
                <FieldRow emoji="💰" label="Monto (S/)" value={form.montoVentaCompleta} onChange={(v) => update("montoVentaCompleta", v)} placeholder="S/ 430.00" />
              </Card>
            )}

            {tipo === "FRACCIONADA" && (
              <>
                <Card className="p-4 space-y-3 border-primary/30">
                  <span className="text-sm font-semibold text-foreground">1er Pago</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg shrink-0">✅</span>
                    <label className="text-sm font-medium text-foreground w-36 shrink-0">Estado 1er Pago</label>
                    <span className="text-sm font-semibold text-primary">PAGO</span>
                  </div>
                  <FieldRow emoji="📅" label="Fecha 1er Pago" value={form.fecha1erPago} onChange={(v) => update("fecha1erPago", v)} placeholder="31/3/2026" />
                  <FieldRow emoji="💰" label="Monto 1er Pago (S/)" value={form.monto1erPago} onChange={(v) => update("monto1erPago", v)} placeholder="S/ 200.00" />
                </Card>
                <Card className="p-4 space-y-3 border-primary/30">
                  <span className="text-sm font-semibold text-foreground">2do Pago</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg shrink-0">✅</span>
                    <label className="text-sm font-medium text-foreground w-36 shrink-0">Estado 2do Pago</label>
                    <select
                      value={form.estado2doPago}
                      onChange={(e) => update("estado2doPago", e.target.value)}
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="DEBE">DEBE</option>
                      <option value="PAGO">PAGO</option>
                    </select>
                  </div>
                  <FieldRow emoji="📅" label="Fecha 2do Pago" value={form.fecha2doPago} onChange={(v) => update("fecha2doPago", v)} placeholder="30/4/2026" />
                  <FieldRow emoji="💰" label="Monto 2do Pago (S/)" value={form.monto2doPago} onChange={(v) => update("monto2doPago", v)} placeholder="S/ 250.00" />
                </Card>
              </>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClear} className="flex-1">
                Limpiar
              </Button>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="w-[380px] shrink-0">
            <Card className="p-4 space-y-3 border-primary/30 bg-accent/30 sticky top-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Vista previa del mensaje</span>
                <Button size="sm" onClick={handleCopy} disabled={!hasContent} className="gap-1.5">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "¡Copiado!" : "Copiar a WhatsApp"}
                </Button>
              </div>
              <pre className="whitespace-pre-wrap text-sm bg-card p-4 rounded-lg border text-card-foreground leading-relaxed text-left">
                {hasContent ? formatted : "Completa los campos para ver la vista previa..."}
              </pre>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
