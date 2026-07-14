# Calcolatore Margine Negozio

## Cosa fa e a chi si rivolge

Strumento web gratuito per calcolare il margine di guadagno, il ricarico (markup), il punto di pareggio e simulare il listino prezzi. Si rivolge a **negozianti, commercianti e piccoli imprenditori** che devono decidere rapidamente a che prezzo vendere un prodotto senza fare i conti a mano o rivolgersi subito a un commercialista.

Non è un tool di contabilità o consulenza fiscale: i calcoli sono indicativi e informativi (vedi disclaimer in footer e in [contatti.html](public/contatti.html)).

## Stack

- **Vite + React** (React 19, JSX, nessun TypeScript)
- Nessuna libreria UI esterna: componenti locali in [src/App.jsx](src/App.jsx) (`Card`, `Label`, `NumInput`, `StatCard`, `AdSlot`)
- Stato locale con `useState`/`useMemo`, nessuno state manager esterno
- Pagine statiche accessorie in `public/` (`privacy.html`, `cookie.html`, `contatti.html`) — HTML puro con CSS inline `<style>`, non componenti React
- **Deploy**: Vercel, produzione con `vercel --prod` (oppure push su `main`, collegato via integrazione GitHub → deploy automatico)

## Stile visivo da rispettare

Tutto lo styling è **inline via oggetto `style={{}}`** — niente CSS modules, niente Tailwind, niente styled-components. L'unico blocco `<style>` globale (dentro `App.jsx`) serve per `@font-face` import, reset, tabelle, scrollbar e input range/slider.

### Palette (oggetto `C` in [App.jsx:27](src/App.jsx:27))

```js
const C = {
  bg: "#faf8f5",        // sfondo pagina
  surface: "#ffffff",   // sfondo card
  border: "#e8e0d4",
  text: "#1a1208",
  muted: "#8a7560",
  accent: "#c8521a",    // arancione bruciato — CTA, tab attiva, evidenziazioni
  accentLight: "#fdf0e8",
  green: "#2a7a4b",      // esiti positivi (margine buono, utile)
  greenLight: "#e8f5ee",
  amber: "#b87a1a",      // esiti intermedi/di attenzione
  font: "'Plus Jakarta Sans', system-ui, sans-serif",
  mono: "'IBM Plex Mono', monospace",
};
```

Usa sempre `C.xxx`, mai colori hardcoded nuovi (eccezioni già presenti come `#c0392b` per errore/rosso e `#95a5a6` per grigio neutro nei grafici a barre sono tollerate ma da preferire solo per stati negativi/neutri specifici).

### Font

- **Plus Jakarta Sans** (`C.font`): testo principale, titoli, paragrafi discorsivi (es. Guida)
- **IBM Plex Mono** (`C.mono`): tutto ciò che è "dato" — label, numeri, valori calcolati, badge, pulsanti, link del footer. Dà il look da "strumento tecnico/dashboard"

### Convenzioni ricorrenti

- Card: `background: C.surface, border: 1px solid C.border, borderRadius: 8, padding: 20`
- Label sopra ogni valore: maiuscolo, `letterSpacing: 0.12em`, `fontSize: 0.6-0.7rem`, colore `C.muted`
- Stati di giudizio (margine buono/accettabile/basso) sempre con tripla `green / amber / rosso (#c0392b)`
- Badge "strumento gratuito" in alto: pallino colorato + testo mono maiuscolo su sfondo `accentLight`

## Altri tool del portfolio (cross-link obbligatorio nel footer)

Ogni tool del portfolio deve linkare gli altri nel footer, sezione "Altri strumenti gratuiti" (vedi [App.jsx:457-462](src/App.jsx:457)):

- **Calcolatore Regime Forfettario** — https://calcolatore-forfettario-eight.vercel.app
- **Calcolatore Mutuo** — https://calcolatore-mutuo-one.vercel.app
- **Calcolatore Costo Dipendente** — https://costo-dipendente.vercel.app
- **Calcolatore Margine Negozio** (questo progetto)

Quando si aggiunge un nuovo tool al portfolio, aggiornare la lista qui e in tutti gli altri progetti collegati.

## Promozione template Gumroad

Link da promuovere ovunque abbia senso (CTA a fine tab, box evidenziato): **https://salvoturco.gumroad.com/l/viejex**

Esempio di CTA già in uso ([App.jsx:277](src/App.jsx:277) e [App.jsx:424](src/App.jsx:424)):
```jsx
<a href="https://salvoturco.gumroad.com/l/viejex" target="_blank" rel="noopener noreferrer" style={{...}}>
  📊 Vuoi gestire cassa e margini in automatico? Scarica il template pronto all'uso →
</a>
```

## Regola contatti

**Niente form di contatto e niente promesse di risposta diretta** ("ti risponderemo entro X giorni", form che invia email, ecc.). Mostrare solo un'**email di riferimento** statica come punto di contatto, senza garanzie di tempistica o gestione automatizzata.

Email di riferimento in uso: **turcosalvatore21@gmail.com** (vedi [public/contatti.html](public/contatti.html)).
