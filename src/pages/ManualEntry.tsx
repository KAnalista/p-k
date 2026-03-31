import { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Copy, Check, FileText, CreditCard, AlertTriangle, Bookmark, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoCcd from "@/assets/logo-ccd.jpeg";

type TipoVenta = "COMPLETA" | "FRACCIONADA" | "DEUDA" | "SEPARACION DE VACANTE";

interface PagoExtra {
  estado: string;
  fecha: string;
  monto: string;
}

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
  montoVentaCompleta: "",
  fecha1erPago: "",
  monto1erPago: "",
  estado2doPago: "DEBE",
  fecha2doPago: "",
  monto2doPago: "",
};

const ordinalLabels = ["3er", "4to", "5to"];

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}/${year}`;
}

function formatMessage(data: FormData, tipo: TipoVenta, pagosExtra: PagoExtra[]): string {
  const lines: string[] = [];

  lines.push("📋 *DATOS DE VALIDACIÓN*");
  lines.push("");

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
    if (data.montoVentaCompleta) lines.push(`💰 *Monto Venta Completa:* S/ ${data.montoVentaCompleta}`);
  } else {
    lines.push("");
    lines.push("📌 *Este es el monto del primer pago:*");
    lines.push("");
    lines.push(`✅ *Estado 1er Pago:* PAGO`);
    if (data.fecha1erPago) lines.push(`📅 *Fecha 1er Pago:* ${formatDateDisplay(data.fecha1erPago)}`);
    if (data.monto1erPago) lines.push(`💰 *Monto 1er Pago:* S/ ${data.monto1erPago}`);
    lines.push("");
    if (data.estado2doPago) lines.push(`✅ *Estado 2do Pago:* ${data.estado2doPago}`);
    if (data.fecha2doPago) lines.push(`📅 *Fecha 2do Pago:* ${formatDateDisplay(data.fecha2doPago)}`);
    if (data.monto2doPago) lines.push(`💰 *Monto 2do Pago:* S/ ${data.monto2doPago}`);

    pagosExtra.forEach((pago, i) => {
      const label = ordinalLabels[i] || `${i + 3}°`;
      lines.push("");
      if (pago.estado) lines.push(`✅ *Estado ${label} Pago:* ${pago.estado}`);
      if (pago.fecha) lines.push(`📅 *Fecha ${label} Pago:* ${formatDateDisplay(pago.fecha)}`);
      if (pago.monto) lines.push(`💰 *Monto ${label} Pago:* S/ ${pago.monto}`);
    });

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
  type?: string;
  inputMode?: "text" | "numeric" | "decimal" | "email" | "tel";
  pattern?: string;
}

function FieldRow({ label, emoji, value, onChange, placeholder, type = "text", inputMode, pattern }: FieldRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg shrink-0">{emoji}</span>
      <label className="text-sm font-medium text-foreground w-36 shrink-0">{label}</label>
      <Input
        type={type}
        inputMode={inputMode}
        pattern={pattern}
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
  const [pagosExtra, setPagosExtra] = useState<PagoExtra[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const update = useCallback((key: keyof FormData, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const updatePagoExtra = useCallback((index: number, field: keyof PagoExtra, val: string) => {
    setPagosExtra((prev) => prev.map((p, i) => i === index ? { ...p, [field]: val } : p));
  }, []);

  const addPagoExtra = useCallback(() => {
    if (pagosExtra.length < 3) {
      setPagosExtra((prev) => [...prev, { estado: "DEBE", fecha: "", monto: "" }]);
    }
  }, [pagosExtra.length]);

  const removePagoExtra = useCallback((index: number) => {
    setPagosExtra((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const formatted = formatMessage(form, tipo, pagosExtra);
  const hasContent = form.nombre || form.telefono || form.dni;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    toast({ title: "¡Copiado!", description: "Mensaje listo para pegar en WhatsApp." });
    setTimeout(() => setCopied(false), 2000);
  }, [formatted, toast]);

  const handleClear = useCallback(() => {
    setForm(initialForm);
    setPagosExtra([]);
    setCopied(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ccd-light via-background to-background flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* Header with logo */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <img src={logoCcd} alt="CCD Logo" className="w-14 h-14 rounded-lg shadow-md object-cover" />
          <div>
            <h1 className="text-2xl font-bold text-ccd-navy tracking-tight">Sistema de Validación CCD</h1>
            <p className="text-sm text-muted-foreground">Generador de mensajes WhatsApp</p>
          </div>
        </div>
        {/* Tipo de venta buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => setTipo("COMPLETA")}
            variant={tipo === "COMPLETA" ? "default" : "outline"}
            className={`gap-2 h-14 text-base font-semibold transition-all ${
              tipo === "COMPLETA"
                ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                : "hover:bg-accent"
            }`}
          >
            <FileText className="w-5 h-5" />
            COMPLETA
          </Button>
          <Button
            onClick={() => setTipo("DEUDA")}
            variant={tipo === "DEUDA" ? "default" : "outline"}
            className={`gap-2 h-14 text-base font-semibold transition-all ${
              tipo === "DEUDA"
                ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                : "hover:bg-accent"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            DEUDA
          </Button>
          <Button
            onClick={() => setTipo("FRACCIONADA")}
            variant={tipo === "FRACCIONADA" ? "default" : "outline"}
            className={`gap-2 h-14 text-base font-semibold transition-all ${
              tipo === "FRACCIONADA"
                ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                : "hover:bg-accent"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            FRACCIONADA
          </Button>
          <Button
            onClick={() => setTipo("SEPARACION DE VACANTE")}
            variant={tipo === "SEPARACION DE VACANTE" ? "default" : "outline"}
            className={`gap-2 h-14 text-sm font-semibold transition-all ${
              tipo === "SEPARACION DE VACANTE"
                ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                : "hover:bg-accent"
            }`}
          >
            <Bookmark className="w-5 h-5" />
            SEPARACIÓN DE VACANTE
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Left: Form */}
          <div className="flex-1 space-y-4">
            <Card className="p-4 space-y-3">
              <span className="text-sm font-semibold text-foreground">Datos del Cliente</span>
              <FieldRow emoji="👤" label="Nombre" value={form.nombre} onChange={(v) => update("nombre", v)} />
              <FieldRow emoji="📱" label="Teléfono" value={form.telefono} onChange={(v) => update("telefono", v)} />
              <FieldRow emoji="🪪" label="DNI/CE" value={form.dni} onChange={(v) => update("dni", v.replace(/\D/g, ""))} inputMode="numeric" pattern="[0-9]*" />
              <FieldRow emoji="📧" label="Correo" value={form.correo} onChange={(v) => update("correo", v)} />
              <FieldRow emoji="📚" label="Curso" value={form.curso} onChange={(v) => update("curso", v)} />
              <FieldRow emoji="🧑‍💼" label="Asesor" value={form.asesor} onChange={(v) => update("asesor", v)} />
            </Card>

            {(tipo === "COMPLETA" || tipo === "DEUDA") && (
              <Card className="p-4 space-y-3 border-primary/30">
                <span className="text-sm font-semibold text-foreground">{tipo === "COMPLETA" ? "Venta Completa" : "Deuda"}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg shrink-0">✅</span>
                  <label className="text-sm font-medium text-foreground w-36 shrink-0">Estado</label>
                  <span className="text-sm font-semibold text-primary">PAGO</span>
                </div>
                <FieldRow emoji="📅" label="Fecha" value={form.fechaVentaCompleta} onChange={(v) => update("fechaVentaCompleta", v)} type="date" />
                <FieldRow emoji="💰" label="Monto (S/)" value={form.montoVentaCompleta} onChange={(v) => update("montoVentaCompleta", v.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="430.00" />
              </Card>
            )}

            {(tipo === "FRACCIONADA" || tipo === "SEPARACION DE VACANTE") && (
              <>
                <Card className="p-4 space-y-3 border-primary/30">
                  <span className="text-sm font-semibold text-foreground">1er Pago</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg shrink-0">✅</span>
                    <label className="text-sm font-medium text-foreground w-36 shrink-0">Estado 1er Pago</label>
                    <span className="text-sm font-semibold text-primary">PAGO</span>
                  </div>
                  <FieldRow emoji="📅" label="Fecha 1er Pago" value={form.fecha1erPago} onChange={(v) => update("fecha1erPago", v)} type="date" />
                  <FieldRow emoji="💰" label="Monto 1er Pago (S/)" value={form.monto1erPago} onChange={(v) => update("monto1erPago", v.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="200.00" />
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
                  <FieldRow emoji="📅" label="Fecha 2do Pago" value={form.fecha2doPago} onChange={(v) => update("fecha2doPago", v)} type="date" />
                  <FieldRow emoji="💰" label="Monto 2do Pago (S/)" value={form.monto2doPago} onChange={(v) => update("monto2doPago", v.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="250.00" />
                </Card>

                {/* Pagos extra dinámicos */}
                {pagosExtra.map((pago, i) => {
                  const label = ordinalLabels[i] || `${i + 3}°`;
                  return (
                    <Card key={i} className="p-4 space-y-3 border-primary/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{label} Pago</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePagoExtra(i)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg shrink-0">✅</span>
                        <label className="text-sm font-medium text-foreground w-36 shrink-0">Estado {label} Pago</label>
                        <select
                          value={pago.estado}
                          onChange={(e) => updatePagoExtra(i, "estado", e.target.value)}
                          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="DEBE">DEBE</option>
                          <option value="PAGO">PAGO</option>
                        </select>
                      </div>
                      <FieldRow emoji="📅" label={`Fecha ${label} Pago`} value={pago.fecha} onChange={(v) => updatePagoExtra(i, "fecha", v)} type="date" />
                      <FieldRow emoji="💰" label={`Monto ${label} Pago (S/)`} value={pago.monto} onChange={(v) => updatePagoExtra(i, "monto", v.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="200.00" />
                    </Card>
                  );
                })}

                {pagosExtra.length < 3 && (
                  <Button
                    variant="outline"
                    onClick={addPagoExtra}
                    className="w-full gap-2 border-dashed border-primary/40 text-primary hover:bg-primary/5"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar {ordinalLabels[pagosExtra.length] || `${pagosExtra.length + 3}°`} Pago
                  </Button>
                )}
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
