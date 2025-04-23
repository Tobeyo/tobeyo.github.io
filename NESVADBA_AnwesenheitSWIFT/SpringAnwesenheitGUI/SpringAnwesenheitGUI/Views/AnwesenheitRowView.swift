import SwiftUI

struct AnwesenheitRowView: View {
    let schueler: Schueler
    let anwesenheit: Anwesenheitseintrag?
    let onAnwesend: () -> Void
    let onAbwesend: () -> Void
    
    var body: some View {
        HStack {
            Text("\(schueler.lfdNr). \(schueler.name)")
            Spacer()
            
            if let anwesenheit = anwesenheit {
                Text(anwesenheit.anwesend ? "Anwesend" : "Abwesend")
                    .foregroundColor(anwesenheit.anwesend ? .green : .red)
            } else {
                HStack {
                    Button("Anwesend", action: onAnwesend)
                        .buttonStyle(.bordered)
                        .tint(.green)
                    
                    Button("Abwesend", action: onAbwesend)
                        .buttonStyle(.bordered)
                        .tint(.red)
                }
            }
        }
    }
} 