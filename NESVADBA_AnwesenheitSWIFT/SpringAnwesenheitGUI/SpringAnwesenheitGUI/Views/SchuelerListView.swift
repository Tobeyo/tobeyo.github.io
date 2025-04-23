import SwiftUI

struct SchuelerListView: View {
    @StateObject private var viewModel = SchuelerViewModel()
    @State private var showingAddSchueler = false
    
    var body: some View {
        NavigationView {
            List {
                ForEach(viewModel.schueler) { schueler in
                    SchuelerRowView(
                        schueler: schueler,
                        onDelete: {
                            Task {
                                await viewModel.deleteSchueler(id: schueler.id)
                            }
                        }
                    )
                }
            }
            .navigationTitle("Schüler")
            .toolbar {
                Button(action: { showingAddSchueler = true }) {
                    Image(systemName: "plus")
                }
            }
            .overlay {
                if viewModel.isLoading {
                    ProgressView()
                }
            }
            .alert("Fehler", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK", role: .cancel) {
                    viewModel.errorMessage = nil
                }
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
        }
        .task {
            await viewModel.fetchSchueler()
        }
        .sheet(isPresented: $showingAddSchueler) {
            AddSchuelerView(
                isPresented: $showingAddSchueler,
                onAdd: { name, lfdNr in
                    Task {
                        await viewModel.addSchueler(name: name, lfdNr: lfdNr)
                    }
                }
            )
        }
    }
} 