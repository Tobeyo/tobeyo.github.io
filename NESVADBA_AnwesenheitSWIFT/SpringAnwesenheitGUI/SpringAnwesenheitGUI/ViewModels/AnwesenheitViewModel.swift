import Foundation

@MainActor
class AnwesenheitViewModel: ObservableObject {
    @Published var anwesenheiten: [Anwesenheitseintrag] = []
    @Published var errorMessage: String?
    @Published var isLoading = false
    @Published var selectedDate = Date()
    
    private let apiService = APIService()
    
    func fetchAnwesenheiten() async {
        isLoading = true
        errorMessage = nil
        
        do {
            anwesenheiten = try await apiService.getAnwesenheitenByDate(date: selectedDate)
        } catch {
            errorMessage = "Fehler beim Laden der Anwesenheiten: \(error.localizedDescription)"
        }
        
        isLoading = false
    }
    
    func addAnwesenheitseintrag(schuelerId: Int64, anwesend: Bool) async {
        isLoading = true
        errorMessage = nil
        
        do {
            _ = try await apiService.addAnwesenheitseintrag(schuelerId: schuelerId, anwesend: anwesend)
            await fetchAnwesenheiten()
        } catch {
            errorMessage = "Fehler beim Eintragen der Anwesenheit: \(error.localizedDescription)"
        }
        
        isLoading = false
    }
} 