import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter } from '@material-tailwind/react';
import { getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany } from '../../services/api';
import { API_BASE_URL } from '../../services/api';

// Helper function to normalize logo URL to use api.bandu.uz
const getLogoUrl = (logo) => {
  if (!logo) return null;
  
  // If logo is already a full URL
  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    // Replace admin.bandu.uz with api.bandu.uz
    return logo.replace(/https?:\/\/admin\.bandu\.uz/g, 'https://api.bandu.uz');
  }
  
  // If logo is a relative path, prepend API_BASE_URL
  // Remove leading slash if present to avoid double slashes
  const cleanPath = logo.startsWith('/') ? logo.substring(1) : logo;
  return `${API_BASE_URL}/${cleanPath}`;
};

// Company Card Component
const CompanyCard = ({ company, onOpenDetails, onEdit, onDelete }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardBody>
        {/* Logo */}
        {company.logo && !logoError ? (
          <div className="mb-4">
            <img 
              src={getLogoUrl(company.logo)} 
              alt={company.name || 'Company logo'} 
              className="w-full h-48 object-cover rounded-lg"
              onError={() => setLogoError(true)}
            />
          </div>
        ) : (
          <div className="mb-4 text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Typography variant="small" color="gray">
              {company.logo ? 'Logo not available' : 'No logo exists'}
            </Typography>
          </div>
        )}

        {/* Company Name */}
        <Typography variant="h5" color="blue-gray" className="mb-3">
          {company.name || 'Unnamed Company'}
        </Typography>

        {/* Company Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <Typography variant="small" color="gray" className="font-semibold">
              ID:
            </Typography>
            <Typography variant="small" color="blue-gray">
              {company.id}
            </Typography>
          </div>
          
          <div className="flex items-center justify-between">
            <Typography variant="small" color="gray" className="font-semibold">
              Categories:
            </Typography>
            <Typography variant="small" color="blue-gray">
              {company.categories?.length || 0}
            </Typography>
          </div>
          
          <div className="flex items-center justify-between">
            <Typography variant="small" color="gray" className="font-semibold">
              Images:
            </Typography>
            <Typography variant="small" color="blue-gray">
              {company.images?.length || 0}
            </Typography>
          </div>
          
          {company.location?.address && (
            <div className="flex items-start gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">📍</span>
              <Typography variant="small" color="gray" className="flex-1">
                {company.location.address}
              </Typography>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            color="blue"
            onClick={() => onOpenDetails(company)}
            className="flex-1">
            Open
          </Button>
          <Button
            size="sm"
            variant="outlined"
            color="blue"
            onClick={() => onEdit(company)}
            className="flex-1">
            Edit
          </Button>
          <Button
            size="sm"
            variant="outlined"
            color="red"
            onClick={() => onDelete(company.id)}
            className="flex-1">
            Delete
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default function Company() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setProcessing(true);
      setError('');
      
      console.log('Fetching company...');
      const response = await getCompanies();
      console.log('Response received:', response);
      
      // Handle different response structures
      let companiesList = [];
      
      if (Array.isArray(response)) {
        // Direct array response
        companiesList = response;
      } else if (response.data) {
        // Response with data property
        if (Array.isArray(response.data)) {
          companiesList = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Nested data structure
          companiesList = response.data.data;
        } else if (response.data.companies && Array.isArray(response.data.companies)) {
          // Company property
          companiesList = response.data.companies;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          // Items property (pagination)
          companiesList = response.data.items;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          // Results property
          companiesList = response.data.results;
        }
      } else if (response.companies && Array.isArray(response.companies)) {
        companiesList = response.companies;
      } else if (response.items && Array.isArray(response.items)) {
        companiesList = response.items;
      } else if (response.results && Array.isArray(response.results)) {
        companiesList = response.results;
      }
      
      console.log('Processed company:', companiesList.length, 'company');
      
      // Small delay to show processing state for large datasets
      if (companiesList.length > 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setCompanies(companiesList);
      
      if (companiesList.length === 0) {
        console.warn('No company found in response. Full response:', response);
        setError('No company found. The response structure might be different than expected.');
      }
    } catch (err) {
      console.error('Error fetching company:', err);
      setError(err.message || 'Failed to load company. Please check the console for details.');
      setCompanies([]);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const handleOpenDetails = (company) => {
    setSelectedCompany(company);
    setLogoError(false);
    setOpenDetailsDialog(true);
  };

  const handleOpenDialog = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name || '',
        description: company.description || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        description: '',
        email: '',
        phone: '',
        address: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCompany(null);
    setFormData({
      name: '',
      description: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (editingCompany) {
        await updateCompany(editingCompany.id, formData);
      } else {
        await createCompany(formData);
      }
      handleCloseDialog();
      fetchCompanies();
      setCurrentPage(1); // Reset to first page after adding/editing
    } catch (err) {
      setError(err.message || 'Failed to save company');
    }
  };

  const handleDelete = async () => {
    try {
      setError('');
      await deleteCompany(deleteId);
      const wasLastItemOnPage = paginatedCompanies.length === 1;
      const wasNotFirstPage = currentPage > 1;
      setOpenDeleteDialog(false);
      setDeleteId(null);
      await fetchCompanies();
      // If current page becomes empty after deletion, go to previous page
      if (wasLastItemOnPage && wasNotFirstPage) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete company');
      setOpenDeleteDialog(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  // Pagination calculations
  const totalPages = Math.ceil(companies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = companies.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Card className="animate-pulse">
      <CardBody>
        <div className="mb-4 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="flex gap-2 pt-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        </div>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex flex-col max-h-screen overflow-hidden">
        <div className="flex-shrink-0 space-y-6 pb-">
          <div className="flex justify-between items-center">
            <Typography variant="h3" color="blue-gray">
              Company
            </Typography>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading company...</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-screen overflow-hidden">
      <div className="flex-shrink-0 space-y-6 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h3" color="blue-gray">
              Company
            </Typography>
            {companies.length > 0 && (
              <Typography variant="small" color="gray" className="mt-1">
                {companies.length} {companies.length === 1 ? 'company' : 'company'} found
              </Typography>
            )}
          </div>
          <Button onClick={() => handleOpenDialog()} color="blue">
            + Add Company
          </Button>
        </div>

        {processing && !loading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-400"></div>
            <span>Processing company data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            <div className="font-semibold mb-1">Error loading company</div>
            <div className="text-sm">{error}</div>
            <Button 
              size="sm" 
              color="red" 
              variant="outlined" 
              className="mt-2"
              onClick={fetchCompanies}>
              Retry
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {companies.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Typography variant="h6" color="gray" className="mb-2">
              No company found
            </Typography>
            <Typography variant="small" color="gray" className="mb-4">
              Get started by creating your first company
            </Typography>
            <Button onClick={() => handleOpenDialog()} color="blue">
              Add Company
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onOpenDetails={handleOpenDetails}
                onEdit={handleOpenDialog}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outlined"
                color="blue"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "filled" : "outlined"}
                        color="blue"
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="min-w-[40px]">
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outlined"
                color="blue"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1">
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          )}

          {/* Page Info */}
          {companies.length > 0 && (
            <div className="text-center mt-4 pb-4">
              <Typography variant="small" color="gray">
                Showing {startIndex + 1} to {Math.min(endIndex, companies.length)} of {companies.length} company
              </Typography>
            </div>
          )}
        </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader>
          {editingCompany ? 'Edit Company' : 'Create New Company'}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <Input
              label="Company Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="dark:text-white"
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="dark:text-white"
            />
            <Input
              type="email"
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="dark:text-white"
            />
            <Input
              type="tel"
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="dark:text-white"
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="dark:text-white"
            />
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleCloseDialog}
              className="mr-1">
              Cancel
            </Button>
            <Button type="submit" color="blue">
              {editingCompany ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} handler={() => setOpenDeleteDialog(false)} size="sm">
        <DialogHeader>Delete Company</DialogHeader>
        <DialogBody>
          <Typography>
            Are you sure you want to delete this company? This action cannot be undone.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setOpenDeleteDialog(false)}
            className="mr-1">
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Company Details Dialog */}
      <Dialog open={openDetailsDialog} handler={() => setOpenDetailsDialog(false)} size="lg">
        <DialogHeader>Company Details</DialogHeader>
        <DialogBody className="max-h-[70vh] overflow-y-auto">
          {selectedCompany && (
            <div className="space-y-6">
              {/* Logo */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Logo
                </Typography>
                {selectedCompany.logo && !logoError ? (
                  <img 
                    src={getLogoUrl(selectedCompany.logo)} 
                    alt={selectedCompany.name || 'Company logo'} 
                    className="w-full max-w-md h-64 object-cover rounded-lg"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-full max-w-md h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Typography variant="small" color="gray">
                      {selectedCompany.logo ? 'Logo not available' : 'No logo exists'}
                    </Typography>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-3">
                  Basic Information
                </Typography>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      ID:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedCompany.id}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Name:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedCompany.name || 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Open 24/7:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedCompany.isOpen247 ? 'Yes' : 'No'}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Location */}
              {selectedCompany.location && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Location
                  </Typography>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        Address:
                      </Typography>
                      <Typography variant="small" color="blue-gray" className="text-right max-w-xs">
                        {selectedCompany.location.address || 'N/A'}
                      </Typography>
                    </div>
                    {selectedCompany.location.latitude && (
                      <div className="flex justify-between">
                        <Typography variant="small" color="gray" className="font-semibold">
                          Latitude:
                        </Typography>
                        <Typography variant="small" color="blue-gray">
                          {selectedCompany.location.latitude}
                        </Typography>
                      </div>
                    )}
                    {selectedCompany.location.longitude && (
                      <div className="flex justify-between">
                        <Typography variant="small" color="gray" className="font-semibold">
                          Longitude:
                        </Typography>
                        <Typography variant="small" color="blue-gray">
                          {selectedCompany.location.longitude}
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Categories */}
              {selectedCompany.categories && selectedCompany.categories.length > 0 && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Categories ({selectedCompany.categories.length})
                  </Typography>
                  <div className="space-y-2">
                    {selectedCompany.categories.map((category) => (
                      <div key={category.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between">
                          <Typography variant="small" color="gray" className="font-semibold">
                            ID: {category.id}
                          </Typography>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            {category.name}
                          </Typography>
                        </div>
                        {category.description && (
                          <Typography variant="small" color="gray" className="mt-1">
                            {category.description}
                          </Typography>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Working Hours */}
              {selectedCompany.workingHours && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Working Hours
                  </Typography>
                  <div className="space-y-2">
                    {Object.entries(selectedCompany.workingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center">
                        <Typography variant="small" color="gray" className="font-semibold capitalize">
                          {day}:
                        </Typography>
                        <Typography variant="small" color="blue-gray">
                          {hours.closed 
                            ? 'Closed' 
                            : `${hours.open || 'N/A'} - ${hours.close || 'N/A'}`}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {selectedCompany.images && selectedCompany.images.length > 0 && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Images ({selectedCompany.images.length})
                  </Typography>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedCompany.images.map((image) => (
                      <div key={image.id} className="relative">
                        <img 
                          src={getLogoUrl(image.url)} 
                          alt={`Image ${image.index}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {image.isMain && (
                          <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setOpenDetailsDialog(false)}
            className="mr-1">
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

