# Landing Page Acceptance Criteria
**Wireframe Reference:** Section 1 - "Landing Page - Map-First Discovery v3"  
**Source:** complete_wireframe_assembly.html  
**Status:** Not Started  
**Last Updated:** October 3, 2025

**SAVE TO:** /Users/barrygilbert/Documents/shopwindow/frontend/LANDING_PAGE_ACCEPTANCE.md

## Overview Requirements
- [ ] Desktop-focused layout (no mobile optimization required)
- [ ] Map-first discovery interface
- [ ] Progressive disclosure pattern (map → lean dashboard → full analysis)
- [ ] Three entry points for core workflows

---

## 1. Header Navigation Bar
### Layout
- [ ] White background (#fff)
- [ ] Border-bottom: 1px solid #ddd
- [ ] Padding: 15px 25px
- [ ] Display: flex, justify-content: space-between

### Logo Area (Left)
- [ ] Text: "Shop Window"
- [ ] Font-weight: bold
- [ ] Color: #2c5aa0
- [ ] Font-size: 16px

### Navigation Items (Center)
- [ ] Display: flex, gap: 25px
- [ ] Each nav item:
  - Padding: 10px 15px
  - Background: #f0f0f0
  - Border-radius: 6px
  - Font-size: 14px
  - Font-weight: 500
- [ ] Active state:
  - Background: #2c5aa0
  - Color: white
- [ ] Nav items: "Dashboard" (active), "Properties", "Reports"

### User Area (Right)
- [ ] Display: flex, align-items: center, gap: 15px
- [ ] Admin button:
  - Background: #dc3545
  - Color: white
  - Padding: 8px 15px
  - Border-radius: 6px
  - Font-size: 12px
  - Font-weight: 500
- [ ] User name: "Barry Gilbert" (14px, color: #333)
- [ ] Avatar: 32px circle, background: #ddd

---

## 2. Hero Section
### Layout
- [ ] Text-align: center
- [ ] Padding: 50px 30px
- [ ] Background: linear-gradient(135deg, #2c5aa0 0%, #1e3a6f 100%)
- [ ] Color: white
- [ ] Margin: -30px -30px 30px -30px (full bleed)

### Title
- [ ] Text: "Commercial Real Estate Intelligence"
- [ ] Font-size: 36px
- [ ] Font-weight: 300
- [ ] Margin-bottom: 15px

### Subtitle
- [ ] Text: "Effective Decision Making from Data"
- [ ] Font-size: 20px
- [ ] Opacity: 0.9
- [ ] Margin-bottom: 40px

### Search Bar
- [ ] Max-width: 600px
- [ ] Margin: 0 auto
- [ ] Position: relative
- [ ] Input field:
  - Width: 100%
  - Padding: 18px 25px
  - Border: none
  - Border-radius: 8px
  - Font-size: 16px
  - Box-shadow: 0 4px 12px rgba(0,0,0,0.1)
  - Placeholder: "Search properties, addresses, or shopping centers..."
- [ ] Search button:
  - Position: absolute, right: 10px, top: 10px
  - Background: #2c5aa0
  - Color: white
  - Padding: 8px 20px
  - Border-radius: 6px
  - Font-weight: 500
  - Text: "Search"

---

## 3. Entry Point Cards (Three-Column Grid)
### Grid Layout
- [ ] Display: grid
- [ ] Grid-template-columns: repeat(3, 1fr)
- [ ] Gap: 30px
- [ ] Margin: 40px 0

### Individual Card Styling
- [ ] Background: white
- [ ] Padding: 30px
- [ ] Border-radius: 10px
- [ ] Text-align: center
- [ ] Box-shadow: 0 4px 16px rgba(0,0,0,0.08)
- [ ] Cursor: pointer
- [ ] Border: 2px solid transparent
- [ ] Transition: transform 0.3s ease, box-shadow 0.3s ease

### Card Hover State
- [ ] Transform: translateY(-4px)
- [ ] Box-shadow: 0 8px 24px rgba(0,0,0,0.12)
- [ ] Border-color: #2c5aa0

### Card 1: Analyze Property
- [ ] Icon: 🏢 (60px circle, background: #e3f2fd, color: #2c5aa0)
- [ ] Title: "Analyze Property" (18px, weight: 600, color: #333)
- [ ] Description: "Deep dive into individual property performance, tenant mix, and market position" (14px, color: #666, line-height: 1.5)

### Card 2: Portfolio Overview
- [ ] Icon: 📊
- [ ] Title: "Portfolio Overview"
- [ ] Description: "Compare multiple properties and analyze portfolio performance"

### Card 3: Financial Modeling
- [ ] Icon: 💰
- [ ] Title: "Financial Modeling"
- [ ] Description: "Create scenarios and investment thesis analysis"

---

## 4. Map Interface (Primary Focus)
### Layout Structure
- [ ] Display: grid
- [ ] Grid-template-columns: 350px 1fr
- [ ] Gap: 30px
- [ ] Height: 600px

### Left Sidebar: Map Filters
#### Container
- [ ] Background: white
- [ ] Border-radius: 10px
- [ ] Padding: 25px
- [ ] Border: 1px solid #ddd
- [ ] Box-shadow: 0 2px 8px rgba(0,0,0,0.05)

#### Filter Header
- [ ] Text: "Map Search Options"
- [ ] Font-weight: 600
- [ ] Font-size: 18px
- [ ] Color: #2c5aa0
- [ ] Margin-bottom: 25px
- [ ] Border-bottom: 2px solid #e0e0e0
- [ ] Padding-bottom: 15px

#### Filter Sections (5 total)
Each filter section:
- [ ] Margin-bottom: 25px
- [ ] Filter title:
  - Font-weight: 600
  - Margin-bottom: 10px
  - Color: #333
  - Font-size: 14px
- [ ] Dropdown:
  - Width: 100%
  - Padding: 10px 15px
  - Border: 1px solid #ddd
  - Border-radius: 6px
  - Background: white
  - Font-size: 14px
  - Cursor: pointer
  - Focus state: outline: none, border-color: #2c5aa0

#### Filter 1: Shopping Center Type
- [ ] Label: "Shopping Center Type"
- [ ] Default option: "— Clear Selection —"
- [ ] Options: Power Centers, Lifestyle Centers, Neighborhood Centers, Strip Centers

#### Filter 2: Owner
- [ ] Label: "Owner"
- [ ] Default option: "— Clear Selection —"
- [ ] Options: CBRE, Simon Property, Kimco Realty, Regency Centers

#### Filter 3: Property Management
- [ ] Label: "Property Management"
- [ ] Default option: "— Clear Selection —"
- [ ] Options: CBRE Property Management, JLL, Cushman & Wakefield, Colliers International

#### Filter 4: State
- [ ] Label: "State"
- [ ] Default option: "— Clear Selection —"
- [ ] Options: Delaware (selected), Pennsylvania, New Jersey, Maryland

#### Filter 5: County
- [ ] Label: "County"
- [ ] Default option: "— Clear Selection —"
- [ ] Options: New Castle County DE, Chester County PA, Delaware County PA, Montgomery County PA

### Right Panel: Google Maps
#### Container
- [ ] Background: #e8f5e8 (placeholder - will be replaced by actual map)
- [ ] Border-radius: 10px
- [ ] Position: relative
- [ ] Display: flex
- [ ] Align-items: center
- [ ] Justify-content: center
- [ ] Border: 1px solid #ddd

#### Map Display
- [ ] Google Maps API integration
- [ ] Default center: Philadelphia Collar Counties region
- [ ] Property markers displayed for all properties matching filters
- [ ] Marker styling:
  - Width: 14px, Height: 14px
  - Background: #2c5aa0
  - Border: 3px solid white
  - Border-radius: 50%
  - Cursor: pointer
  - Box-shadow: 0 2px 8px rgba(0,0,0,0.2)
  - Hover: cursor pointer

---

## 5. Lean Dashboard Overlay
**Trigger:** User clicks property marker on map  
**Behavior:** Modal overlay appears at bottom of map

### Container
- [ ] Position: absolute
- [ ] Bottom: 25px, Left: 25px, Right: 25px
- [ ] Background: white
- [ ] Border-radius: 10px
- [ ] Box-shadow: 0 8px 24px rgba(0,0,0,0.15)
- [ ] Padding: 25px
- [ ] Border: 1px solid #ddd

### Header Section
- [ ] Display: flex
- [ ] Justify-content: space-between
- [ ] Align-items: flex-start
- [ ] Margin-bottom: 20px

#### Property Info (Left)
- [ ] H3 property name:
  - Margin: 0 0 8px 0
  - Color: #2c5aa0
  - Font-size: 18px
- [ ] Address line:
  - Margin: 0
  - Color: #666
  - Font-size: 14px
  - Format: "Address • Center Type"

#### Actions (Right)
- [ ] Display: flex
- [ ] Gap: 12px
- [ ] Close button:
  - Padding: 8px 15px
  - Border: 1px solid #ddd
  - Background: white
  - Border-radius: 6px
  - Font-size: 12px
  - Font-weight: 500
  - Text: "✕"
- [ ] Expand button:
  - Padding: 8px 15px
  - Background: #2c5aa0
  - Color: white
  - Border: none
  - Border-radius: 6px
  - Font-size: 12px
  - Font-weight: 500
  - Text: "Full Analysis"

### Metrics Grid
- [ ] Display: grid
- [ ] Grid-template-columns: repeat(4, 1fr)
- [ ] Gap: 20px

#### Individual Metric (4 total)
- [ ] Text-align: center
- [ ] Metric value:
  - Font-size: 20px
  - Font-weight: 600
  - Color: #2c5aa0
  - Margin-bottom: 5px
- [ ] Metric label:
  - Font-size: 11px
  - Color: #666
  - Text-transform: uppercase
  - Letter-spacing: 0.5px

#### Metric 1: Total SF
- [ ] Value: "156K"
- [ ] Label: "TOTAL SF"

#### Metric 2: Occupancy
- [ ] Value: "94%"
- [ ] Label: "OCCUPANCY"

#### Metric 3: Avg Rent PSF
- [ ] Value: "$18.50"
- [ ] Label: "AVG RENT PSF"

#### Metric 4: Tenants
- [ ] Value: "23"
- [ ] Label: "TENANTS"

---

## Data Requirements

### API Endpoints Needed
- [ ] `GET /api/v1/shopping-centers/` - Property list with coordinates
- [ ] `GET /api/v1/shopping-centers/?filter_params` - Filtered properties
- [ ] `GET /api/v1/shopping-centers/{id}/` - Property details for lean dashboard

### Required Data Fields
From API response:
- [ ] `id` - Property identifier
- [ ] `shopping_center_name` - Display name
- [ ] `address_street`, `address_city`, `address_state`, `address_zip` - Location
- [ ] `center_type` - Property classification
- [ ] `latitude`, `longitude` - Map coordinates (CRITICAL - use Google Geocoding API)
- [ ] `total_gla` - For "Total SF" metric
- [ ] `occupancy_rate` - For "Occupancy" metric (calculated)
- [ ] `avg_rent_psf` - For "Avg Rent PSF" metric (calculated)
- [ ] `tenant_count` - For "Tenants" metric (calculated)

---

## Known Backend Issues
⚠️ **SOLUTION CONFIRMED**: Backend properties have `null` latitude/longitude values
- **Solution:** Use Google Maps Geocoding API on frontend
- **Process:** Fetch properties → geocode addresses → display markers

---

## Definition of Done
Landing page is complete when:
1. All checkboxes above are ✅
2. Screenshot matches wireframe Section 1
3. Real data flows from localhost:8000 API
4. Google Geocoding converts addresses to coordinates
5. Barry Gilbert approves visual implementation
6. No console errors
7. Responsive at desktop resolutions (1280px - 1920px)