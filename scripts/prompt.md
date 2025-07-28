Analysiere alle Linear Issues und identifiziere zusammenhängende Aufgaben, die strategisch als nächstes angegangen werden sollten. Berücksichtige dabei folgende Priorisierungskriterien:

**Issue-Auswahl-Logik:**
- Abhängigkeiten: Issues, die Blocker für andere Aufgaben sind
- Kritischer Pfad: Aufgaben, die für wichtige Features/Releases benötigt werden
- Zusammenhang: Issues, die thematisch oder technisch zusammengehören

Wähle basierend auf dieser strategischen Analyse die Issues aus, die logisch als nächstes bearbeitet werden müssen, und bestimme einen aussagekräftigen Branch-Namen, der den gemeinsamen Zweck widerspiegelt.

**Arbeitsablauf:**
1. **Strategische Planung:**
   - Begründe die Auswahl der Issues basierend auf obigen Kriterien
   - Definiere die optimale Bearbeitungsreihenfolge
   - Erstelle den neuen Branch mit aussagekräftigem Namen

2. **Linear Issue-Management:**
   - Weise jeden ausgewählten Issue Dennis Ollhoff zu
   - Setze den Status jedes Issues auf "In Progress"

3. **Sequenzielle Umsetzung:**
   - Bearbeite die Issues in der definierten Reihenfolge
   - Erstelle für jeden Issue eine detaillierte Todo-Liste
   - Implementiere alle Todos vollständig
   - Führe nach Abschluss jedes Issues folgende Checks durch:
     * TypeScript Type-Check
     * Linting
   - Behebe alle gefundenen Fehler gründlich (keine "any"-Types oder oberflächliche Fixes)
   - Erst nach erfolgreichem Abschluss zum nächsten Issue übergehen

4. **Abschluss:**
   - Erstelle einen Pull Request
   - Verlinke im PR-Body alle bearbeiteten Issues mit "Closes #[Issue-Nummer]"
   - Dokumentiere im PR die strategische Begründung für die Issue-Auswahl
