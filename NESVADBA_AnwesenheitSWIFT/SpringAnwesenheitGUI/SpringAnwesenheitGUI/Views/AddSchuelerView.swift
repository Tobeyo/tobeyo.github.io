import SwiftUI

struct AddSchuelerView: View {
    @Binding var isPresented: Bool
    @State private var name = ""
    @State private var lfdNr = ""
    let onAdd: (String, Int) -> Void
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField(text: $name) {
                        Text("Name eingeben")
                    }
                    TextField(text: $lfdNr) {
                        Text("Laufende Nummer eingeben")
                    }
                    .keyboardType(.numberPad)
                }
                
                Section {
                    Button("Hinzufügen") {
                        if let lfdNr = Int(lfdNr) {
                            onAdd(name, lfdNr)
                            isPresented = false
                        }
                    }
                    .disabled(name.isEmpty || lfdNr.isEmpty)
                    
                    Button("Abbrechen", role: .cancel) {
                        isPresented = false
                    }
                }
            }
            .navigationTitle("Neuer Schüler")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
} 
