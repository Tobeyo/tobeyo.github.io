import SwiftUI

struct AnwesenheitView: View {
    @StateObject private var viewModel = AnwesenheitViewModel()
    @StateObject private var schuelerViewModel = SchuelerViewModel()
    
    var body: some View {
        NavigationView {
            VStack {
                DatePickerView(
                    selectedDate: $viewModel.selectedDate,
                    onDateChanged: {
                        Task {
                            await viewModel.fetchAnwesenheiten()
                        }
                    }
                )
                
                AnwesenheitListView(
                    schueler: schuelerViewModel.schueler,
                    anwesenheiten: viewModel.anwesenheiten,
                    onAnwesend: { schuelerId in
                        Task {
                            await viewModel.addAnwesenheitseintrag(schuelerId: schuelerId, anwesend: true)
                        }
                    },
                    onAbwesend: { schuelerId in
                        Task {
                            await viewModel.addAnwesenheitseintrag(schuelerId: schuelerId, anwesend: false)
                        }
                    }
                )
            }
            .navigationTitle("Anwesenheit")
            .overlay {
                if viewModel.isLoading || schuelerViewModel.isLoading {
                    ProgressView()
                }
            }
            .alert("Fehler", isPresented: .constant(viewModel.errorMessage != nil || schuelerViewModel.errorMessage != nil)) {
                Button("OK", role: .cancel) {
                    viewModel.errorMessage = nil
                    schuelerViewModel.errorMessage = nil
                }
            } message: {
                Text(viewModel.errorMessage ?? schuelerViewModel.errorMessage ?? "")
            }
        }
        .task {
            await viewModel.fetchAnwesenheiten()
            await schuelerViewModel.fetchSchueler()
        }
    }
} 
