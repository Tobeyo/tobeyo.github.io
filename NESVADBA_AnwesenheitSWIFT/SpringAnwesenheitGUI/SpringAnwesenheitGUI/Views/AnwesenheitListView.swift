import SwiftUI

struct AnwesenheitListView: View {
    let schueler: [Schueler]
    let anwesenheiten: [Anwesenheitseintrag]
    let onAnwesend: (Int64) -> Void
    let onAbwesend: (Int64) -> Void
    
    var body: some View {
        List {
            ForEach(schueler) { schueler in
                AnwesenheitRowView(
                    schueler: schueler,
                    anwesenheit: anwesenheiten.first { $0.schueler.id == schueler.id },
                    onAnwesend: { onAnwesend(schueler.id) },
                    onAbwesend: { onAbwesend(schueler.id) }
                )
            }
        }
    }
} 