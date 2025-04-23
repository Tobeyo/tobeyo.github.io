import Foundation

struct Anwesenheitseintrag: Codable, Identifiable {
    let id: Int64
    let schueler: Schueler
    let anwesend: Bool
    let zeitpunkt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case schueler
        case anwesend
        case zeitpunkt
    }
} 