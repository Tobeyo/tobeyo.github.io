import Foundation

struct Schueler: Codable, Identifiable {
    let id: Int64
    let lfdNr: Int
    let name: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case lfdNr
        case name
    }
} 