import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ClipboardPaste, Copy, Check, MessageCircle, PenLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FIELD_LABELS = [
  "Marcar", "Fecha de Matrícula", "Código Campaña", "Asesor Comercial",
  "Nombre", "Apellido", "Teléfono", "DNI", "Correo Electrónico",
  "Curso/Diploma", "Fecha de Inicio", "Tipo de Pago", "Tipo de Venta",
  "Estado Venta Completa", "Fecha Venta Completa", "Monto Venta Completa",
  "Estado 1er Pago VF", "Fecha 1er Pago", "Monto 1er Pago",
  "Estado 2do Pago VF", "Fecha 2do Pago", "Monto 2do Pago",
  "Incluye Regalo", "Curso/Diploma Regalo",
  "CEL", "CIP", "CARNET", "AUTODESK", "PMI", "CERTI. FÍSICO CCD", "CERTI. DIGITAL CCD", "PREPARACIÓN LICENCIAMIENTO",
  "Imágenes", "Observación", "Submitter", "Submission Date", "Submission ID",
  "Date Hoja", "Date Gd Fecha", "Date Gd Mont"
];

const WHATSAPP_FIELDS = [
  { idx: 4, emoji: "👤", label: "Nombre", combine: 5 },
  { idx: 6, emoji: "📱", label: "Teléfono" },
  { idx: 7, emoji: "🪪", label: "DNI" },
  { idx: 8, emoji: "📧", label: "Correo" },
  { idx: 9, emoji: "📚", label: "Curso" },
  
  { idx: 3, emoji: "🧑‍💼", label: "Asesor", bold: true },
  { idx: 12, emoji: "📋", label: "Tipo Venta" },
  { idx: 13, emoji: "✅", label: "Estado Venta Completa" },
  { idx: 14, emoji: "📅", label: "Fecha Venta Completa" },
  { idx: 15, emoji: "💰", label: "Monto Venta Completa" },
];

const WHATSAPP_FIELDS_PAGO1 = [
  { idx: 16, emoji: "✅", label: "Estado 1er Pago" },
  { idx: 17, emoji: "📅", label: "Fecha 1er Pago" },
  { idx: 18, emoji: "💰", label: "Monto 1er Pago" },
];

const WHATSAPP_FIELDS_PAGO2 = [
  { idx: 19, emoji: "✅", label: "Estado 2do Pago" },
  { idx: 20, emoji: "📅", label: "Fecha 2do Pago" },
  { idx: 21, emoji: "💰", label: "Monto 2do Pago" },
];

function formatLine(fields: string[], { idx, emoji, label, combine, bold }: any): string {
  const val = combine && fields[combine] ? `${fields[idx]} ${fields[combine]}` : fields[idx];
  const displayVal = bold ? `*${val}*` : val;
  return `${emoji} *${label}:* ${displayVal}`;
}

function formatForWhatsApp(fields: string[]): string {
  const lines: string[] = [];

  WHATSAPP_FIELDS.forEach((f) => {
    if (fields[f.idx] && fields[f.idx] !== "") {
      lines.push(formatLine(fields, f));
    }
  });

  const isFraccionada = (fields[12] || "").toUpperCase().includes("FRACCIONADA");

  if (isFraccionada) {
    lines.push("");
    lines.push("📌 *Este es el monto del primer pago:*");
    lines.push("");
    WHATSAPP_FIELDS_PAGO1.forEach((f) => {
      if (fields[f.idx] && fields[f.idx] !== "") {
        lines.push(formatLine(fields, f));
      }
    });
    lines.push("");
    WHATSAPP_FIELDS_PAGO2.forEach((f) => {
      if (fields[f.idx] && fields[f.idx] !== "") {
        lines.push(formatLine(fields, f));
      }
    });
    lines.push("");
    lines.push("⚠️ *No se olvide la siguiente fecha de pago.*");
  }

  return lines.join("\n");
}

function parseRow(raw: string): string[] {
  return raw.split("\t").map((s) => s.trim());
}

export default function Index() {
  const [raw, setRaw] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleParse = useCallback(() => {
    const parsed = parseRow(raw);
    if (parsed.length < 8) {
      toast({ title: "Datos insuficientes", description: "Pega una fila completa del Excel.", variant: "destructive" });
      return;
    }
    setFields(parsed);
    setCopied(false);
  }, [raw, toast]);

  const formatted = fields.length > 0 ? formatForWhatsApp(fields) : "";

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    toast({ title: "¡Copiado!", description: "Mensaje listo para pegar en WhatsApp." });
    setTimeout(() => setCopied(false), 2000);
  }, [formatted, toast]);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRaw(text);
      const parsed = parseRow(text);
      if (parsed.length >= 8) {
        setFields(parsed);
        setCopied(false);
      }
    } catch {
      toast({ title: "No se pudo leer", description: "Pega manualmente con Ctrl+V", variant: "destructive" });
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
            <MessageCircle className="w-4 h-4" />
            Excel → WhatsApp
          </div>
          <h1 className="text-2xl font-bold text-foreground">Formateador de Pagos</h1>
          <p className="text-muted-foreground text-sm">Pega la fila del Excel y obtén el mensaje formateado</p>
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-1.5 mt-2">
              <PenLine className="w-3.5 h-3.5" /> Ingreso Manual
            </Button>
          </Link>
        </div>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Fila copiada del Excel</label>
            <Button variant="outline" size="sm" onClick={handlePasteFromClipboard} className="gap-1.5">
              <ClipboardPaste className="w-3.5 h-3.5" /> Pegar
            </Button>
          </div>
          <Textarea
            placeholder="Pega aquí la fila copiada del Excel (separada por tabs)..."
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={3}
            className="text-xs font-mono"
          />
          <Button onClick={handleParse} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Formatear para WhatsApp
          </Button>
        </Card>

        {formatted && (
          <Card className="p-4 space-y-3 border-primary/30 bg-accent/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Mensaje para WhatsApp</span>
              <Button
                size="sm"
                onClick={handleCopy}
                className={copied ? "bg-primary text-primary-foreground" : ""}
                variant={copied ? "default" : "outline"}
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? "¡Copiado!" : "Copiar"}
              </Button>
            </div>
            <pre className="whitespace-pre-wrap text-sm bg-card p-4 rounded-lg border text-card-foreground leading-relaxed">
              {formatted}
            </pre>
          </Card>
        )}

        {fields.length > 0 && (
          <Card className="p-4 space-y-2">
            <span className="text-sm font-medium text-foreground">Campos detectados ({fields.length})</span>
            <div className="grid grid-cols-1 gap-1 text-xs max-h-60 overflow-y-auto">
              {fields.map((val, i) => (
                <div key={i} className="flex gap-2 py-1 border-b border-border last:border-0">
                  <span className="text-muted-foreground w-44 shrink-0 font-medium">{FIELD_LABELS[i] || `Campo ${i + 1}`}</span>
                  <span className="text-foreground break-all">{val || "—"}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
