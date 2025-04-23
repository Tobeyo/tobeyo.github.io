import Foundation

@MainActor
class SchuelerViewModel: ObservableObject {
    @Published var schueler: [Schueler] = []
    @Published var errorMessage: String?
    @Published var isLoading = false
    
    private let apiService = APIService()
    
    func fetchSchueler() async {
        isLoading = true
        errorMessage = nil
        
        do {
            schueler = try await apiService.fetchAllSchueler()
        } catch {
            errorMessage = "Fehler beim Laden der Schüler: \(error.localizedDescription)"
        }
        
        isLoading = false
    }
    
    func addSchueler(name: String, lfdNr: Int) async {
        isLoading = true
        errorMessage = nil
        
        do {
            _ = try await apiService.addSchueler(name: name, lfdNr: lfdNr)
            await fetchSchueler()
        } catch {
            errorMessage = "Fehler beim Hinzufügen des Schülers: \(error.localizedDescription)"
        }
        
        isLoading = false
    }
    
    func deleteSchueler(id: Int64) async {
        isLoading = true
        errorMessage = nil
        
        do {
            try await apiService.deleteSchueler(id: id)
            await fetchSchueler()
        } catch {
            errorMessage = "Fehler beim Löschen des Schülers: \(error.localizedDescription)"
        }
        
        isLoading = false
    }
} 