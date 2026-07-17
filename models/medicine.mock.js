// Mock medicine model for testing without database
class MockMedicine {
  constructor(id, name, manufacturerName, type, packSizeLabel, composition1, composition2) {
    this.id = id;
    this.name = name;
    this.manufacturerName = manufacturerName;
    this.type = type;
    this.packSizeLabel = packSizeLabel;
    this.composition1 = composition1;
    this.composition2 = composition2;
  }

  // Mock data for testing
  static mockData = [
    { id: 1, name: 'Cetanil-T', manufacturer_name: 'Cetanil Pharma', type: 'Tablet', pack_size_label: '10 tablets', composition1: 'Cetirizine 10mg', composition2: null },
    { id: 2, name: 'Cetanil-M', manufacturer_name: 'Cetanil Pharma', type: 'Tablet', pack_size_label: '15 tablets', composition1: 'Cetirizine 5mg', composition2: null },
    { id: 3, name: 'Paracetamol', manufacturer_name: 'Health Pharma', type: 'Tablet', pack_size_label: '20 tablets', composition1: 'Paracetamol 500mg', composition2: null },
    { id: 4, name: 'Ibuprofen', manufacturer_name: 'Pain Relief', type: 'Tablet', pack_size_label: '10 tablets', composition1: 'Ibuprofen 400mg', composition2: null },
    { id: 5, name: 'Amoxicillin', manufacturer_name: 'Antibiotic Ltd', type: 'Capsule', pack_size_label: '10 capsules', composition1: 'Amoxicillin 250mg', composition2: null },
    { id: 6, name: 'Cetirizine', manufacturer_name: 'Allergy Relief', type: 'Syrup', pack_size_label: '100ml', composition1: 'Cetirizine 5mg/5ml', composition2: null }
  ];

  static async searchMedicineNames(searchTerm) {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const searchPattern = searchTerm.toLowerCase();
    const results = MockMedicine.mockData.filter(medicine => 
      medicine.name.toLowerCase().includes(searchPattern)
    );
    
    return [results];
  }
}

module.exports = MockMedicine;