import Foundation

class NetworkService {
    static let shared = NetworkService()
    private let baseURL = "http://localhost:8080/api"
    
    private init() {}
    
    func fetch<T: Decodable>(endpoint: String) async throws -> T {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(T.self, from: data)
    }
} 