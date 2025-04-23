import Foundation

class APIService {
    private let baseURL = "http://192.168.1.100:8080/api"
    
    func fetchStudents() async throws -> [Student] {
        let url = URL(string: "\(baseURL)/schueler")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([Student].self, from: data)
    }
    
    func markAttendance(studentId: Int, isPresent: Bool, timestamp: Date? = nil) async throws {
        var components = URLComponents(string: "\(baseURL)/anwesenheit")!
        var queryItems = [
            URLQueryItem(name: "schuelerId", value: String(studentId)),
            URLQueryItem(name: "anwesend", value: String(isPresent))
        ]
        
        if let timestamp = timestamp {
            let formatter = ISO8601DateFormatter()
            queryItems.append(URLQueryItem(name: "zeitpunkt", value: formatter.string(from: timestamp)))
        }
        
        components.queryItems = queryItems
        
        var request = URLRequest(url: components.url!)
        request.httpMethod = "POST"
        
        _ = try await URLSession.shared.data(for: request)
    }
    
    func deleteStudent(id: Int) async throws {
        let url = URL(string: "\(baseURL)/schueler/\(id)")!
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        
        _ = try await URLSession.shared.data(for: request)
    }
} 