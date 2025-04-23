import Foundation

enum APIError: Error {
    case invalidURL
    case networkError(Error)
    case decodingError(Error)
    case serverError(String)
}

class APIService {
    private let baseURL = "http://localhost:8080/api"
    
    // MARK: - Schüler Endpoints
    
    func fetchAllSchueler() async throws -> [Schueler] {
        guard let url = URL(string: "\(baseURL)/schueler") else {
            throw APIError.invalidURL
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([Schueler].self, from: data)
    }
    
    func addSchueler(name: String, lfdNr: Int) async throws -> Schueler {
        guard let url = URL(string: "\(baseURL)/schueler") else {
            throw APIError.invalidURL
        }
        
        let schueler = Schueler(id: 0, lfdNr: lfdNr, name: name)
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(schueler)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(Schueler.self, from: data)
    }
    
    func deleteSchueler(id: Int64) async throws {
        guard let url = URL(string: "\(baseURL)/schueler/\(id)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        
        _ = try await URLSession.shared.data(for: request)
    }
    
    // MARK: - Anwesenheit Endpoints
    
    func addAnwesenheitseintrag(schuelerId: Int64, anwesend: Bool, zeitpunkt: Date? = nil) async throws -> Anwesenheitseintrag {
        guard let url = URL(string: "\(baseURL)/anwesenheit") else {
            throw APIError.invalidURL
        }
        
        var components = URLComponents(url: url, resolvingAgainstBaseURL: true)!
        components.queryItems = [
            URLQueryItem(name: "schuelerId", value: String(schuelerId)),
            URLQueryItem(name: "anwesend", value: String(anwesend))
        ]
        
        if let zeitpunkt = zeitpunkt {
            let formatter = ISO8601DateFormatter()
            components.queryItems?.append(URLQueryItem(name: "zeitpunkt", value: formatter.string(from: zeitpunkt)))
        }
        
        var request = URLRequest(url: components.url!)
        request.httpMethod = "POST"
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(Anwesenheitseintrag.self, from: data)
    }
    
    func getAnwesenheitenByDate(date: Date) async throws -> [Anwesenheitseintrag] {
        guard let url = URL(string: "\(baseURL)/anwesenheit") else {
            throw APIError.invalidURL
        }
        
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate]
        
        var components = URLComponents(url: url, resolvingAgainstBaseURL: true)!
        components.queryItems = [
            URLQueryItem(name: "datum", value: formatter.string(from: date))
        ]
        
        let (data, _) = try await URLSession.shared.data(from: components.url!)
        return try JSONDecoder().decode([Anwesenheitseintrag].self, from: data)
    }
} 