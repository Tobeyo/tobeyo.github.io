//
//  ContentView.swift
//  StudySync
//
//  Created by Tobias Nesvadba on 27.08.24.
//

import SwiftUI

struct ContentView: View {
    @State private var anwesenheiten: [Anwesenheit] = []
    @State private var schueler: [Schueler] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        TabView {
            SchuelerListView()
                .tabItem {
                    Label("Schüler", systemImage: "person.3")
                }
            
            AnwesenheitView()
                .tabItem {
                    Label("Anwesenheit", systemImage: "checkmark.circle")
                }
        }
    }
}

#Preview {
    ContentView()
}
