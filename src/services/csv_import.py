import csv
import logging
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Dict, List, Any, Tuple
from django.db import transaction
from properties.models import ShoppingCenter, Tenant
from services.geocoding import geocode_address

logger = logging.getLogger(__name__)


class CSVImportService:
    """
    Service for importing shopping center and tenant data from CSV files.
    Implements progressive data enrichment with detailed error reporting.
    """
    
    def __init__(self):
        self.results = {
            'shopping_centers_created': 0,
            'shopping_centers_updated': 0,
            'tenants_created': 0,
            'tenants_updated': 0,
            'rows_processed': 0,
            'rows_failed': 0,
            'errors': [],
            'quality_flags': []
        }
    
    def import_csv(self, csv_file_path: str) -> Dict[str, Any]:
        """
        Import shopping centers and tenants from CSV file.
        
        Args:
            csv_file_path: Path to CSV file
            
        Returns:
            Dictionary with detailed import results
        """
        logger.info(f"Starting CSV import from: {csv_file_path}")
        
        try:
            with open(csv_file_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                
                # Validate headers
                if not self._validate_headers(reader.fieldnames):
                    return self.results
                
                # Process each row
                for row_num, row in enumerate(reader, start=2):  # Start at 2 (row 1 is header)
                    self._process_row(row_num, row)
                    self.results['rows_processed'] += 1
        
        except Exception as e:
            logger.error(f"Fatal error during CSV import: {str(e)}")
            self.results['errors'].append({
                'row': 0,
                'error': f"Fatal import error: {str(e)}"
            })
        
        logger.info(f"CSV import complete. Results: {self.results}")
        return self.results
    
    def _validate_headers(self, headers: List[str]) -> bool:
        """Validate CSV headers match expected schema."""
        required_headers = {'shopping_center_name'}
        expected_headers = {
            'shopping_center_name', 'center_type', 'address_street', 'address_city',
            'address_state', 'address_zip', 'county', 'municipality', 'zoning_authority',
            'year_built', 'owner', 'property_manager', 'leasing_agent', 'leasing_brokerage',
            'total_gla', 'tenant_name', 'tenant_suite_number', 'square_footage',
            'retail_category', 'ownership_type', 'base_rent', 'lease_term',
            'lease_commence', 'lease_expiration', 'credit_category'
        }
        
        headers_set = set(headers)
        
        # Check required headers
        missing_required = required_headers - headers_set
        if missing_required:
            error_msg = f"Missing required headers: {missing_required}"
            logger.error(error_msg)
            self.results['errors'].append({'row': 0, 'error': error_msg})
            return False
        
        # Check for unexpected headers (excluding 'Categories' which we ignore)
        unexpected = headers_set - expected_headers - {'Categories'}
        if unexpected:
            logger.warning(f"Unexpected headers (will be ignored): {unexpected}")
        
        return True
    
    @transaction.atomic
    def _process_row(self, row_num: int, row: Dict[str, str]) -> None:
        """
        Process a single CSV row. Each row is its own transaction.
        
        Args:
            row_num: Row number in CSV (for error reporting)
            row: Dictionary of CSV values
        """
        try:
            # Extract shopping center name (required)
            center_name = self._clean_string(row.get('shopping_center_name'))
            if not center_name:
                raise ValueError("Missing shopping_center_name (required field)")
            
            # Process shopping center
            shopping_center, center_created = self._process_shopping_center(row_num, row, center_name)
            
            if center_created:
                self.results['shopping_centers_created'] += 1
            else:
                self.results['shopping_centers_updated'] += 1
            
            # Process tenant (if tenant data present)
            tenant_name = self._clean_string(row.get('tenant_name'))
            if tenant_name:
                tenant_created = self._process_tenant(row_num, row, shopping_center, tenant_name)
                if tenant_created:
                    self.results['tenants_created'] += 1
                else:
                    self.results['tenants_updated'] += 1
            else:
                # Flag: Shopping center without tenant
                self.results['quality_flags'].append({
                    'row': row_num,
                    'flag': 'Shopping center only (no tenant)'
                })
        
        except Exception as e:
            self.results['rows_failed'] += 1
            self.results['errors'].append({
                'row': row_num,
                'error': str(e)
            })
            logger.error(f"Error processing row {row_num}: {str(e)}")
            # Transaction will rollback for this row only
            raise
    
    def _process_shopping_center(self, row_num: int, row: Dict[str, str], center_name: str) -> Tuple[ShoppingCenter, bool]:
        """
        Create or update shopping center from CSV row.
        
        Returns:
            Tuple of (ShoppingCenter object, was_created boolean)
        """
        # Get or create shopping center
        shopping_center, created = ShoppingCenter.objects.get_or_create(
            shopping_center_name=center_name
        )
        
        # Prepare update data (only non-empty CSV values)
        update_data = {}
        
        # String fields
        for field in ['center_type', 'address_street', 'address_city', 'address_state',
                      'county', 'municipality', 'zoning_authority', 'owner',
                      'property_manager', 'leasing_agent', 'leasing_brokerage']:
            value = self._clean_string(row.get(field))
            if value:  # Only update if CSV has non-empty value
                update_data[field] = value
        
        # Numeric fields
        if zip_code := self._clean_string(row.get('address_zip')):
            update_data['address_zip'] = zip_code
        
        if year_built := self._parse_int(row.get('year_built')):
            update_data['year_built'] = year_built
        
        if total_gla := self._parse_decimal(row.get('total_gla')):
            update_data['total_gla'] = total_gla
        
        # Check if address changed (for re-geocoding)
        address_changed = False
        if not created:
            old_address = f"{shopping_center.address_street} {shopping_center.address_city} {shopping_center.address_state} {shopping_center.address_zip}"
            new_address = f"{update_data.get('address_street', shopping_center.address_street)} {update_data.get('address_city', shopping_center.address_city)} {update_data.get('address_state', shopping_center.address_state)} {update_data.get('address_zip', shopping_center.address_zip)}"
            address_changed = (old_address != new_address)
        
        # Update fields
        for field, value in update_data.items():
            setattr(shopping_center, field, value)
        
        # Geocode if new or address changed
        if created or address_changed or not shopping_center.latitude:
            self._geocode_shopping_center(row_num, shopping_center)
        
        shopping_center.save()
        
        # Quality flags
        self._check_shopping_center_quality(row_num, shopping_center, row)
        
        return shopping_center, created
    
    def _process_tenant(self, row_num: int, row: Dict[str, str], shopping_center: ShoppingCenter, tenant_name: str) -> bool:
        """
        Create or update tenant for shopping center.
        
        Returns:
            Boolean indicating if tenant was created (True) or updated (False)
        """
        # Get or create tenant (match by name within same shopping center)
        tenant, created = Tenant.objects.get_or_create(
            shopping_center=shopping_center,
            tenant_name=tenant_name
        )
        
        # Prepare update data
        update_data = {}
        
        # String fields
        if suite_number := self._clean_string(row.get('tenant_suite_number')):
            update_data['tenant_suite_number'] = suite_number
        
        if retail_category := self._clean_string(row.get('retail_category')):
            update_data['retail_category'] = [retail_category]  # Array field
        
        if ownership_type := self._clean_string(row.get('ownership_type')):
            update_data['ownership_type'] = ownership_type
        
        if credit_category := self._clean_string(row.get('credit_category')):
            update_data['credit_category'] = credit_category
        
        if lease_expiration := self._clean_string(row.get('lease_expiration')):
            update_data['lease_expiration'] = lease_expiration
        
        # Numeric fields
        if square_footage := self._parse_decimal(row.get('square_footage')):
            update_data['square_footage'] = square_footage
        
        if base_rent := self._parse_decimal(row.get('base_rent')):
            update_data['base_rent'] = base_rent
        
        if lease_term := self._parse_int(row.get('lease_term')):
            update_data['lease_term'] = lease_term
        
        # Date fields
        if lease_commence := self._parse_date(row.get('lease_commence')):
            update_data['lease_commence'] = lease_commence
        
        # Update fields
        for field, value in update_data.items():
            setattr(tenant, field, value)
        
        tenant.save()
        
        # Quality flags
        self._check_tenant_quality(row_num, tenant, row)
        
        return created
    
    def _geocode_shopping_center(self, row_num: int, shopping_center: ShoppingCenter) -> None:
        """Geocode shopping center address using Google Maps API."""
        if not all([shopping_center.address_street, shopping_center.address_city, shopping_center.address_state]):
            self.results['quality_flags'].append({
                'row': row_num,
                'flag': 'Incomplete address - cannot geocode'
            })
            return
        
        full_address = f"{shopping_center.address_street}, {shopping_center.address_city}, {shopping_center.address_state}"
        if shopping_center.address_zip:
            full_address += f" {shopping_center.address_zip}"
        
        try:
            result = geocode_address(full_address)
            if result:
                shopping_center.latitude = result['latitude']
                shopping_center.longitude = result['longitude']
                logger.info(f"Geocoded: {shopping_center.shopping_center_name} -> {result['latitude']}, {result['longitude']}")
            else:
                self.results['quality_flags'].append({
                    'row': row_num,
                    'flag': f'Geocoding failed for address: {full_address}'
                })
        except Exception as e:
            self.results['quality_flags'].append({
                'row': row_num,
                'flag': f'Geocoding error: {str(e)}'
            })
    
    def _check_shopping_center_quality(self, row_num: int, shopping_center: ShoppingCenter, row: Dict[str, str]) -> None:
        """Check for quality issues in shopping center data."""
        if not shopping_center.total_gla:
            self.results['quality_flags'].append({
                'row': row_num,
                'flag': 'Missing total_gla'
            })
        
        if not shopping_center.owner:
            self.results['quality_flags'].append({
                'row': row_num,
                'flag': 'Missing owner'
            })
        
        if not shopping_center.property_manager:
            self.results['quality_flags'].append({
                'row': row_num,
                'flag': 'Missing property_manager'
            })
    
    def _check_tenant_quality(self, row_num: int, tenant: Tenant, row: Dict[str, str]) -> None:
        """Check for quality issues in tenant data."""
        if not tenant.square_footage:
            self.results['quality_flags'].append({
                'row': row_num,
                'flag': 'Missing tenant square_footage'
            })
        
        if not tenant.retail_category or not tenant.retail_category[0]:
            self.results['quality_flags'].append({
                'row': row_num,
                'flag': 'Missing retail_category'
            })
    
    # Utility methods for data cleaning and parsing
    
    @staticmethod
    def _clean_string(value: Any) -> str:
        """Clean and normalize string values."""
        if value is None or value == '':
            return ''
        if isinstance(value, float) and value != value:  # NaN check
            return ''
        return str(value).strip()
    
    @staticmethod
    def _parse_int(value: Any) -> int:
        """Parse integer value, return None if invalid."""
        if not value or (isinstance(value, float) and value != value):  # NaN check
            return None
        try:
            return int(float(value))
        except (ValueError, TypeError):
            return None
    
    @staticmethod
    def _parse_decimal(value: Any) -> Decimal:
        """Parse decimal value, return None if invalid."""
        if not value or (isinstance(value, float) and value != value):  # NaN check
            return None
        try:
            return Decimal(str(value))
        except (InvalidOperation, ValueError, TypeError):
            return None
    
    @staticmethod
    def _parse_date(value: Any) -> datetime:
        """Parse date value in M/D/YYYY format."""
        if not value or (isinstance(value, float) and value != value):  # NaN check
            return None
        try:
            # Try M/D/YYYY format first
            return datetime.strptime(str(value).strip(), '%m/%d/%Y').date()
        except ValueError:
            try:
                # Try M/D/YY format
                return datetime.strptime(str(value).strip(), '%m/%d/%y').date()
            except ValueError:
                return None