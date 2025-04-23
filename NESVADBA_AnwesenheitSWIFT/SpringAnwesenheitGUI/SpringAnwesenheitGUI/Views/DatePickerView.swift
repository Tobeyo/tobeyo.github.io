import SwiftUI

struct DatePickerView: View {
    @Binding var selectedDate: Date
    let onDateChanged: () -> Void
    
    var body: some View {
        DatePicker("Datum", selection: $selectedDate, displayedComponents: .date)
            .datePickerStyle(.compact)
            .padding()
            .onChange(of: selectedDate) { _ in
                onDateChanged()
            }
    }
} 