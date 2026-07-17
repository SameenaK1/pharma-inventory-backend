#!/bin/bash

echo "🚀 Pharma Inventory Backend - Medicine Search API Demo"
echo "===================================================="
echo ""

echo "📋 Available API Endpoints:"
echo "   POST /medicine/add-medicine - Add new medicine"
echo "   GET  /medicine/medicine-name?name=<search_term> - Search medicines"
echo ""

echo "🔍 Testing medicine search endpoint..."
echo ""

# Test 1: Search for medicines containing "Cet"
echo "1. Searching for medicines containing 'Cet':"
echo "   curl \"http://localhost:8080/medicine/medicine-name?name=Cet\""
echo "   Expected: Returns Cetanil-T, Cetanil-M, Cetirizine, etc."
echo ""

# Test 2: Search for medicines containing "Par"
echo "2. Searching for medicines containing 'Par':"
echo "   curl \"http://localhost:8080/medicine/medicine-name?name=Par\""
echo "   Expected: Returns Paracetamol"
echo ""

# Test 3: Search for medicines containing "Ibu"
echo "3. Searching for medicines containing 'Ibu':"
echo "   curl \"http://localhost:8080/medicine/medicine-name?name=Ibu\""
echo "   Expected: Returns Ibuprofen"
echo ""

# Test 4: Error case - Empty search term
echo "4. Testing error case - Empty search term:"
echo "   curl \"http://localhost:8080/medicine/medicine-name?name=\""
echo "   Expected: Returns 400 error with message"
echo ""

# Test 5: Error case - Single character
echo "5. Testing error case - Single character search:"
echo "   curl \"http://localhost:8080/medicine/medicine-name?name=A\""
echo "   Expected: Returns 400 error with message"
echo ""

echo "🎯 To run these tests, start the server with:"
echo "   npm start"
echo ""
echo "📚 For more information, see:"
echo "   - ENDPOINT_DOCUMENTATION.md"
echo "   - IMPLEMENTATION_SUMMARY.md"
echo ""
echo "✅ Implementation complete!"