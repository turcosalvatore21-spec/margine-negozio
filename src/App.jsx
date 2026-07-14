import { useState, useMemo } from "react";

const fmt = n => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);
const fmtP = n => Number(n).toFixed(2).replace(".", ",") + "%";

function AdSlot({ id, size = "leaderboard" }) {
  const sizes = { leaderboard: { w: "728px", h: "90px" }, rect: { w: "336px", h: "280px" } };
  const { w, h } = sizes[size] || sizes.leaderboard;
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "28px 0" }}>
      <div style={{
        width: w, maxWidth: "100%", height: h, background: "#f8f5f0",
        border: "1px dashed #c8b89a", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 4
      }}>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.58rem", letterSpacing: "0.15em", color: "#c8b89a", textTransform: "uppercase" }}>
          Spazio Pubblicitario — AdSense
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "0.5rem", color: "#d4c4aa" }}>
          Slot ID: {id}
        </span>
      </div>
    </div>
  );
}

const C = {
  bg: "#faf8f5",
  surface: "#ffffff",
  border: "#e8e0d4",
  text: "#1a1208",
  muted: "#8a7560",
  accent: "#c8521a",
  accentLight: "#fdf0e8",
  green: "#2a7a4b",
  greenLight: "#e8f5ee",
  amber: "#b87a1a",
  font: "'Plus Jakarta Sans', system-ui, sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

function Label({ children }) {
  return <p style={{ fontFamily: C.mono, fontSize: "0.62rem", letterSpacing: "0.12em", color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>{children}</p>;
}

function Card({ children, style = {}, color }) {
  return (
    <div style={{
      background: color ? color : C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 8, padding: 20, ...style
    }}>
      {children}
    </div>
  );
}

function NumInput({ label, value, onChange, min = 0, max = 999999, step = 1, unit = "€", hint }) {
  return (
    <Card>
      <Label>{label}</Label>
      {hint && <p style={{ fontFamily: C.mono, fontSize: "0.6rem", color: C.muted, marginBottom: 8 }}>{hint}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="number" value={value} onChange={e => onChange(Number(e.target.value))}
          step={step} min={min} max={max}
          style={{
            background: "transparent", border: "none", borderBottom: `2px solid ${C.border}`,
            color: C.text, fontFamily: C.mono, fontSize: "1.3rem", width: "100%",
            padding: "4px 0", outline: "none", transition: "border 0.2s"
          }}
          onFocus={e => e.target.style.borderBottomColor = C.accent}
          onBlur={e => e.target.style.borderBottomColor = C.border}
        />
        <span style={{ fontFamily: C.mono, fontSize: "0.8rem", color: C.muted, flexShrink: 0 }}>{unit}</span>
      </div>
    </Card>
  );
}

function StatCard({ label, value, color, sub, bg }) {
  return (
    <Card color={bg}>
      <Label>{label}</Label>
      <p style={{ fontFamily: C.mono, fontSize: "1.4rem", fontWeight: 700, color: color || C.text, marginTop: 4 }}>{value}</p>
      {sub && <p style={{ fontFamily: C.mono, fontSize: "0.62rem", color: C.muted, marginTop: 4 }}>{sub}</p>}
    </Card>
  );
}

const TABS = [["base", "Calcolatore"], ["pareggio", "Punto di Pareggio"], ["listino", "Simulatore Listino"], ["guida", "Guida Margini"]];

export default function App() {
  const [costoAcquisto, setCostoAcquisto] = useState(10);
  const [prezzoVendita, setPrezzoVendita] = useState(25);
  const [iva, setIva] = useState(22);
  const [speseSpedizione, setSpeseSpedizione] = useState(0);
  const [altreSpese, setAltreSpese] = useState(0);
  const [unitaVendute, setUnitaVendute] = useState(100);
  const [speseFisse, setSpeseFisse] = useState(1500);
  const [activeTab, setActiveTab] = useState("base");

  const calc = useMemo(() => {
    const costoTotale = costoAcquisto + speseSpedizione + altreSpese;
    const ivaAmt = prezzoVendita * (iva / (100 + iva));
    const prezzoNetto = prezzoVendita - ivaAmt;
    const margineEuro = prezzoNetto - costoTotale;
    const marginePerc = prezzoNetto > 0 ? (margineEuro / prezzoNetto) * 100 : 0;
    const ricarico = costoTotale > 0 ? (margineEuro / costoTotale) * 100 : 0;
    const roi = costoTotale > 0 ? (margineEuro / costoTotale) * 100 : 0;
    return { costoTotale, ivaAmt, prezzoNetto, margineEuro, marginePerc, ricarico, roi };
  }, [costoAcquisto, prezzoVendita, iva, speseSpedizione, altreSpese]);

  const pareggio = useMemo(() => {
    if (calc.margineEuro <= 0) return { unitaNecessarie: Infinity, fatturatoNecessario: Infinity, margineAnno: 0 };
    const unitaNecessarie = Math.ceil(speseFisse / calc.margineEuro);
    const fatturatoNecessario = unitaNecessarie * prezzoVendita;
    const margineAnno = (unitaVendute * calc.margineEuro) - speseFisse;
    return { unitaNecessarie, fatturatoNecessario, margineAnno };
  }, [calc, speseFisse, unitaVendute, prezzoVendita]);

  const listino = useMemo(() => {
    return [20, 30, 40, 50, 60, 70].map(margTarget => {
      const prezzoSuggerito = calc.costoTotale / (1 - margTarget / 100);
      const prezzoConIva = prezzoSuggerito * (1 + iva / 100);
      return { margTarget, prezzoSuggerito, prezzoConIva };
    });
  }, [calc.costoTotale, iva]);

  const margineColor = calc.marginePerc >= 40 ? C.green : calc.marginePerc >= 20 ? C.amber : "#c0392b";
  const margineBg = calc.marginePerc >= 40 ? C.greenLight : calc.marginePerc >= 20 ? "#fef9e7" : "#fdecea";

  return (
    <div style={{ fontFamily: C.font, minHeight: "100vh", background: C.bg, color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        table{width:100%;border-collapse:collapse}
        th{text-align:left;padding:10px 14px;color:${C.muted};font-family:${C.mono};font-weight:400;font-size:0.67rem;letter-spacing:0.08em;border-bottom:2px solid ${C.border}}
        td{text-align:left;padding:9px 14px;border-bottom:1px solid ${C.border};color:${C.text};font-family:${C.mono};font-size:0.75rem}
        tr:hover td{background:#faf5ee}
        input[type=range]{-webkit-appearance:none;width:100%;height:2px;background:${C.border};outline:none;cursor:pointer;border-radius:2px}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${C.accent};cursor:pointer}
        ::-webkit-scrollbar{height:4px;width:4px}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
        details summary{cursor:pointer;list-style:none}
        details summary::-webkit-details-marker{display:none}
      `}</style>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 18px" }}>

        {/* HEADER */}
        <div style={{
          marginBottom: 32, paddingBottom: 24, borderBottom: `2px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16
        }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12,
              background: C.accentLight, border: `1px solid ${C.accent}30`, borderRadius: 4, padding: "3px 10px"
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent }} />
              <span style={{ fontFamily: C.mono, fontSize: "0.6rem", letterSpacing: "0.15em", color: C.accent, textTransform: "uppercase" }}>
                Strumento Gratuito per Negozianti
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15 }}>
              Calcolatore<br />
              <span style={{ color: C.accent }}>Margine di Guadagno</span>
            </h1>
            <p style={{ fontFamily: C.mono, fontSize: "0.68rem", color: C.muted, marginTop: 8 }}>
              Margine · Ricarico · Punto di pareggio · Simulatore prezzi
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="/privacy.html" style={{ fontFamily: C.mono, fontSize: "0.62rem", color: C.muted, textDecoration: "none" }}>Privacy</a>
            <a href="/cookie.html" style={{ fontFamily: C.mono, fontSize: "0.62rem", color: C.muted, textDecoration: "none" }}>Cookie</a>
            <a href="/contatti.html" style={{ fontFamily: C.mono, fontSize: "0.62rem", color: C.muted, textDecoration: "none" }}>Contatti</a>
          </div>
        </div>

        <AdSlot id="top-leaderboard" size="leaderboard" />

        {/* TABS */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 28, gap: 0, overflowX: "auto" }}>
          {TABS.map(([k, v]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              style={{
                background: "none", border: "none",
                borderBottom: `3px solid ${activeTab === k ? C.accent : "transparent"}`,
                marginBottom: "-1px", cursor: "pointer", padding: "10px 22px",
                fontFamily: C.font, fontSize: "0.88rem", fontWeight: activeTab === k ? 600 : 400,
                color: activeTab === k ? C.accent : C.muted, whiteSpace: "nowrap", transition: "all 0.18s"
              }}>
              {v}
            </button>
          ))}
        </div>

        {/* TAB 1 — CALCOLATORE BASE */}
        {activeTab === "base" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginBottom: 10 }}>
              <NumInput label="Prezzo di acquisto (costo)" value={costoAcquisto} onChange={setCostoAcquisto} step={0.5} hint="Quanto paghi il prodotto al fornitore" />
              <NumInput label="Prezzo di vendita (ivato)" value={prezzoVendita} onChange={setPrezzoVendita} step={0.5} hint="Quanto lo vendi al cliente" />
              <Card>
                <Label>Aliquota IVA</Label>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  {[4, 10, 22].map(v => (
                    <button key={v} onClick={() => setIva(v)} style={{
                      padding: "8px 18px", border: `1px solid ${iva === v ? C.accent : C.border}`,
                      background: iva === v ? C.accentLight : "transparent",
                      color: iva === v ? C.accent : C.muted, fontFamily: C.mono,
                      fontSize: "0.8rem", cursor: "pointer", borderRadius: 5, fontWeight: iva === v ? 600 : 400
                    }}>{v}%</button>
                  ))}
                </div>
              </Card>
            </div>

            <details style={{ marginBottom: 16 }}>
              <summary style={{
                fontFamily: C.mono, fontSize: "0.67rem", letterSpacing: "0.1em", color: C.muted,
                textTransform: "uppercase", padding: "10px 0", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8
              }}>
                <span style={{ color: C.accent }}>▸</span> Spese aggiuntive (opzionale)
              </summary>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                <NumInput label="Spese spedizione / imballo" value={speseSpedizione} onChange={setSpeseSpedizione} step={0.5} />
                <NumInput label="Altre spese variabili" value={altreSpese} onChange={setAltreSpese} step={0.5} />
              </div>
            </details>

            {/* RISULTATI */}
            <Card color={margineBg} style={{ marginBottom: 10, border: `1px solid ${margineColor}30` }}>
              <Label>Margine Netto</Label>
              <p style={{ fontFamily: C.mono, fontSize: "3rem", fontWeight: 700, color: margineColor, lineHeight: 1, letterSpacing: "-0.02em" }}>
                {fmtP(calc.marginePerc)}
              </p>
              <p style={{ fontFamily: C.mono, fontSize: "0.7rem", color: C.muted, marginTop: 8 }}>
                {fmt(calc.margineEuro)} per unità &nbsp;·&nbsp; Prezzo netto (senza IVA): {fmt(calc.prezzoNetto)}
              </p>
              <p style={{ fontFamily: C.mono, fontSize: "0.65rem", color: margineColor, marginTop: 6, fontWeight: 500 }}>
                {calc.marginePerc >= 40 ? "✓ Ottimo margine" : calc.marginePerc >= 20 ? "⚠ Margine accettabile ma migliorabile" : "✗ Margine troppo basso — rischio perdita"}
              </p>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 8, marginBottom: 10 }}>
              <StatCard label="Costo totale prodotto" value={fmt(calc.costoTotale)} />
              <StatCard label="IVA inclusa nel prezzo" value={fmt(calc.ivaAmt)} color={C.muted} />
              <StatCard label="Ricarico sul costo" value={fmtP(calc.ricarico)} color={C.accent} sub="(markup)" />
              <StatCard label="ROI per unità" value={fmtP(calc.roi)} color={C.green} />
            </div>

            <Card>
              <Label>Composizione del prezzo di vendita</Label>
              <div style={{ height: 10, borderRadius: 5, overflow: "hidden", display: "flex", gap: 2, marginTop: 12, marginBottom: 10 }}>
                {[
                  [calc.costoTotale, "#e74c3c"],
                  [calc.margineEuro > 0 ? calc.margineEuro : 0, C.green],
                  [calc.ivaAmt, "#95a5a6"]
                ].map(([v, c], i) => (
                  <div key={i} style={{ flex: Math.max(v, 0), background: c, transition: "flex 0.4s" }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[["Costo", calc.costoTotale, "#e74c3c"], ["Margine", Math.max(calc.margineEuro, 0), C.green], ["IVA", calc.ivaAmt, "#95a5a6"]].map(([l, v, c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, background: c, borderRadius: "50%" }} />
                    <span style={{ fontFamily: C.mono, fontSize: "0.65rem", color: C.muted }}>{l}</span>
                    <span style={{ fontFamily: C.mono, fontSize: "0.65rem", color: C.text, fontWeight: 500 }}>{fmt(v)}</span>
                  </div>
                ))}
              </div>
            </Card>
            <AdSlot id="base-rect" size="rect" />
            <a href="https://salvoturco.gumroad.com/l/viejex"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    display: "block",
    marginTop: 24,
    padding: "20px 24px",
    borderRadius: 12,
    background: C.accent || "#111",
    color: "#fff",
    textDecoration: "none",
    textAlign: "center",
    fontFamily: C.mono,
  }}
>
  📊 Vuoi gestire cassa e margini in automatico? Scarica il template pronto all'uso →
</a>
          </div>
        )}

        {/* TAB 2 — PUNTO DI PAREGGIO */}
        {activeTab === "pareggio" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, marginBottom: 16 }}>
              <NumInput label="Spese fisse mensili" value={speseFisse} onChange={setSpeseFisse} step={50} hint="Affitto, luce, stipendi, ecc." />
              <NumInput label="Unità vendute al mese" value={unitaVendute} onChange={setUnitaVendute} step={10} unit="pz" />
            </div>

            {calc.margineEuro <= 0 ? (
              <Card color="#fdecea">
                <p style={{ fontFamily: C.mono, color: "#c0392b", fontSize: "0.85rem" }}>
                  ✗ Impossibile calcolare il pareggio: il margine per unità è negativo. Aumenta il prezzo di vendita o riduci i costi.
                </p>
              </Card>
            ) : (
              <>
                <Card color={C.accentLight} style={{ marginBottom: 10, border: `1px solid ${C.accent}30` }}>
                  <Label>Unità da vendere per coprire i costi fissi</Label>
                  <p style={{ fontFamily: C.mono, fontSize: "3rem", fontWeight: 700, color: C.accent, lineHeight: 1 }}>
                    {pareggio.unitaNecessarie} pz
                  </p>
                  <p style={{ fontFamily: C.mono, fontSize: "0.7rem", color: C.muted, marginTop: 8 }}>
                    Fatturato minimo necessario: {fmt(pareggio.fatturatoNecessario)}
                  </p>
                </Card>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <StatCard
                    label="Margine lordo mensile"
                    value={fmt(unitaVendute * calc.margineEuro)}
                    color={unitaVendute * calc.margineEuro >= speseFisse ? C.green : "#c0392b"}
                  />
                  <StatCard
                    label="Utile netto mensile"
                    value={fmt(pareggio.margineAnno)}
                    color={pareggio.margineAnno >= 0 ? C.green : "#c0392b"}
                    bg={pareggio.margineAnno >= 0 ? C.greenLight : "#fdecea"}
                    sub={pareggio.margineAnno >= 0 ? "✓ In utile" : "✗ In perdita"}
                  />
                </div>

                <Card>
                  <Label>Progresso verso il pareggio</Label>
                  <div style={{ height: 10, background: C.border, borderRadius: 5, marginTop: 12, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${Math.min((unitaVendute / pareggio.unitaNecessarie) * 100, 100)}%`,
                      background: unitaVendute >= pareggio.unitaNecessarie ? C.green : C.accent,
                      borderRadius: 5, transition: "width 0.4s"
                    }} />
                  </div>
                  <p style={{ fontFamily: C.mono, fontSize: "0.65rem", color: C.muted, marginTop: 8 }}>
                    {unitaVendute} / {pareggio.unitaNecessarie} unità ({Math.round((unitaVendute / pareggio.unitaNecessarie) * 100)}%)
                  </p>
                </Card>
              </>
            )}
            <AdSlot id="pareggio-leader" size="leaderboard" />
          </div>
        )}

        {/* TAB 3 — SIMULATORE LISTINO */}
        {activeTab === "listino" && (
          <div>
            <p style={{ fontFamily: C.mono, fontSize: "0.67rem", color: C.muted, marginBottom: 14 }}>
              Costo prodotto: {fmt(calc.costoTotale)} · IVA {iva}% · Prezzi suggeriti per diversi obiettivi di margine
            </p>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Margine obiettivo</th>
                      <th>Prezzo netto (senza IVA)</th>
                      <th>Prezzo al cliente (con IVA {iva}%)</th>
                      <th>Guadagno per pezzo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listino.map(r => (
                      <tr key={r.margTarget} style={{ background: Math.abs(r.prezzoConIva - prezzoVendita) < 0.5 ? C.accentLight : "transparent" }}>
                        <td style={{ fontWeight: 600, color: r.margTarget >= 40 ? C.green : r.margTarget >= 20 ? C.amber : "#c0392b" }}>
                          {r.margTarget}%
                        </td>
                        <td>{fmt(r.prezzoSuggerito)}</td>
                        <td style={{ fontWeight: 600 }}>{fmt(r.prezzoConIva)}</td>
                        <td style={{ color: C.green }}>{fmt(r.prezzoSuggerito - calc.costoTotale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <AdSlot id="listino-rect" size="rect" />
          </div>
        )}

        {/* TAB 4 — GUIDA */}
        {activeTab === "guida" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                title: "Cos'è il Margine di Guadagno?",
                content: "Il margine di guadagno (o margine lordo) indica quanta parte del prezzo di vendita rimane come profitto dopo aver sottratto il costo del prodotto. Si calcola come: (Prezzo di vendita - Costo) / Prezzo di vendita × 100. Un margine del 30% significa che per ogni 100€ incassati, 30€ sono profitto lordo."
              },
              {
                title: "Qual è un buon margine per un negozio?",
                content: "Dipende dal settore. Abbigliamento e accessori: 50-70%. Alimentari: 20-35%. Elettronica: 10-20%. Cosmetica e profumeria: 40-60%. Articoli sportivi: 35-50%. Come regola generale, un margine sotto il 20% è difficile da sostenere con le spese fisse tipiche di un negozio."
              },
              {
                title: "Differenza tra Margine e Ricarico",
                content: "Il margine si calcola sul prezzo di vendita, il ricarico (markup) si calcola sul costo di acquisto. Esempio: compri a 10€ e vendi a 25€. Margine = (25-10)/25 = 60%. Ricarico = (25-10)/10 = 150%. Entrambi misurano la redditività ma da angolazioni diverse. I fornitori spesso parlano di ricarico, i bilanci usano il margine."
              },
              {
                title: "Come calcolare il punto di pareggio",
                content: "Il punto di pareggio (break-even) è il numero di pezzi da vendere per coprire tutti i costi fissi. Formula: Spese fisse / Margine per unità. Se hai 1.500€ di spese fisse mensili e guadagni 15€ a pezzo, devi vendere almeno 100 pezzi al mese prima di essere in utile."
              },
              {
                title: "IVA: cosa devi sapere",
                content: "L'IVA non è un tuo guadagno — la incassi dal cliente e la versi allo Stato. Devi sempre calcolare i tuoi margini sul prezzo NETTO (senza IVA). Le aliquote IVA in Italia sono: 4% (beni di prima necessità), 10% (alimenti, ristoranti, alcuni servizi), 22% (la maggior parte dei prodotti)."
              }
            ].map(({ title, content }) => (
              <Card key={title}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: C.text, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: "0.88rem", color: C.muted, lineHeight: 1.7 }}>{content}</p>
              </Card>
            ))}
            <AdSlot id="guida-leader" size="leaderboard" />
            <a href="https://salvoturco.gumroad.com/l/viejex"
target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            marginTop: 24,
            padding: "20px 24px",
            borderRadius: 12,
            background: C.accent || "#111",
            color: "#fff",
            textDecoration: "none",
            textAlign: "center",
            fontFamily: C.mono,
          }}
        >
          📊 Vuoi gestire cassa e margini in automatico? Scarica il template pronto all'uso →
        </a>
          </div>
        )}

        {/* FOOTER */}
        <div style={{
          marginTop: 40, paddingTop: 20, borderTop: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12
        }}>
          <p style={{ fontFamily: C.mono, fontSize: "0.58rem", color: C.border, lineHeight: 1.9 }}>
            Strumento gratuito a scopo informativo. I calcoli sono indicativi. Consulta un commercialista per decisioni fiscali.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/privacy.html" style={{ fontFamily: C.mono, fontSize: "0.6rem", color: C.muted, textDecoration: "none" }}>Privacy Policy</a>
            <a href="/cookie.html" style={{ fontFamily: C.mono, fontSize: "0.6rem", color: C.muted, textDecoration: "none" }}>Cookie Policy</a>
            <a href="/contatti.html" style={{ fontFamily: C.mono, fontSize: "0.6rem", color: C.muted, textDecoration: "none" }}>Contatti</a>
          </div>
          <p style={{ marginTop: 12, fontFamily: C.mono, fontSize: "0.58rem", width: "100%", textAlign: "center" }}>
  Altri strumenti gratuiti:{" "}
  <a href="https://calcolatore-forfettario-eight.vercel.app" target="_blank" rel="noopener" style={{ color: "inherit", textDecoration: "underline", margin: "0 6px" }}>Calcolatore Regime Forfettario</a>
  <a href="https://calcolatore-mutuo-one.vercel.app" target="_blank" rel="noopener" style={{ color: "inherit", textDecoration: "underline", margin: "0 6px" }}>Calcolatore Mutuo</a>
  <a href="https://costo-dipendente.vercel.app" target="_blank" rel="noopener" style={{ color: "inherit", textDecoration: "underline", margin: "0 6px" }}>Calcolatore Costo Dipendente</a>
</p>
        </div>
      </div>
    </div>
  );
}
