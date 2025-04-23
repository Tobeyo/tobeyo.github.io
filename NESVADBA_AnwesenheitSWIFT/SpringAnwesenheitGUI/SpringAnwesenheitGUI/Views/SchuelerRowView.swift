import SwiftUI

struct SchuelerRowView: View {
    let schueler: Schueler
    let onDelete: () -> Void
    
    var body: some View {
        HStack {
            Text("\(schueler.lfdNr). \(schueler.name)")
            Spacer()
            Button(action: onDelete) {
                Image(systemName: "trash")
                    .foregroundColor(.red)
            }
        }
    }
} 