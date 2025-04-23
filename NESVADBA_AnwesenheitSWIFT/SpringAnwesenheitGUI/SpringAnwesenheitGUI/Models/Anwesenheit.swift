import Foundation

struct Anwesenheit: Codable, Identifiable {
    let id: Int64
    let schuelerId: Int64
    let datum: Date
    let status: String
    let bemerkung: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case schuelerId
        case datum
        case status
        case bemerkung
    }
} 