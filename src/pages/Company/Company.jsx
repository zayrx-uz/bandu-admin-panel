import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter } from '@material-tailwind/react';
import { getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany } from '../../services/api';

// Company Card Component
const CompanyCard = ({ company, onOpenDetails, onDelete }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardBody>
        {/* Logo */}
        {company.logo && !logoError ? (
          <div className="mb-4">
            <img 
              src={company.logo} 
              alt={company.name || 'Company logo'} 
              className="w-full h-48 object-cover rounded-lg"
              onError={() => setLogoError(true)}
            />
          </div>
        ) : (
          <div className="mb-4 text-center py-8 bg-gray-100 rounded-lg">
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
            <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600 mt-1">📍</span>
              <Typography variant="small" color="gray" className="flex-1">
                {company.location.address}
              </Typography>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    isOpen247: false,
    location: {
      address: '',
      latitude: '',
      longitude: '',
    },
    workingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: true },
      sunday: { open: '09:00', close: '18:00', closed: true },
    },
    images: [],
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [currentPage]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setProcessing(true);
      setError('');
      
      console.log('Fetching company page:', currentPage);
      const response = await getCompanies({ page: currentPage, limit: itemsPerPage });
      console.log('Response received:', response);
      
      // Handle different response structures
      let companiesList = [];
      let paginationMeta = {};
      
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
        
        // Extract pagination metadata
        if (response.data.total !== undefined) {
          paginationMeta.total = response.data.total;
        }
        if (response.data.totalPages !== undefined) {
          paginationMeta.totalPages = response.data.totalPages;
        }
        if (response.data.page !== undefined) {
          paginationMeta.page = response.data.page;
        }
        if (response.data.limit !== undefined) {
          paginationMeta.limit = response.data.limit;
        }
        // Check for meta object
        if (response.data.meta) {
          paginationMeta = { ...paginationMeta, ...response.data.meta };
        }
      } else if (response.companies && Array.isArray(response.companies)) {
        companiesList = response.companies;
      } else if (response.items && Array.isArray(response.items)) {
        companiesList = response.items;
      } else if (response.results && Array.isArray(response.results)) {
        companiesList = response.results;
      }
      
      // Extract pagination from root level if available
      if (response.total !== undefined) {
        paginationMeta.total = response.total;
      }
      if (response.totalPages !== undefined) {
        paginationMeta.totalPages = response.totalPages;
      }
      if (response.page !== undefined) {
        paginationMeta.page = response.page;
      }
      if (response.limit !== undefined) {
        paginationMeta.limit = response.limit;
      }
      // Check for meta object at root level
      if (response.meta) {
        paginationMeta = { ...paginationMeta, ...response.meta };
      }
      
      console.log('Processed company:', companiesList.length, 'company');
      console.log('Pagination meta:', paginationMeta);
      
      setCompanies(companiesList);
      
      // Update pagination state
      if (paginationMeta.totalPages) {
        setTotalPages(paginationMeta.totalPages);
      } else if (paginationMeta.total) {
        setTotalPages(Math.ceil(paginationMeta.total / itemsPerPage));
      } else {
        // Fallback: if no pagination info, assume single page
        setTotalPages(companiesList.length > 0 ? 1 : 0);
      }
      
      if (paginationMeta.total !== undefined) {
        setTotalItems(paginationMeta.total);
      } else {
        setTotalItems(companiesList.length);
      }
      
      if (companiesList.length === 0 && currentPage === 1) {
        console.warn('No company found in response. Full response:', response);
      }
    } catch (err) {
      console.error('Error fetching company:', err);
      setError(err.message || 'Failed to load company. Please check the console for details.');
      setCompanies([]);
      setTotalPages(0);
      setTotalItems(0);
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
        logo: company.logo || '',
        isOpen247: company.isOpen247 || false,
        location: {
          address: company.location?.address || '',
          latitude: company.location?.latitude?.toString() || '',
          longitude: company.location?.longitude?.toString() || '',
        },
        workingHours: company.workingHours || {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: true },
          sunday: { open: '09:00', close: '18:00', closed: true },
        },
        images: company.images ? company.images.map((img, index) => ({
          url: img.url || '',
          isMain: img.isMain || false,
          index: img.index !== undefined ? img.index : index,
        })) : [],
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        logo: '',
        isOpen247: false,
        location: {
          address: '',
          latitude: '',
          longitude: '',
        },
        workingHours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: true },
          sunday: { open: '09:00', close: '18:00', closed: true },
        },
        images: [],
      });
    }
    setNewImageUrl('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCompany(null);
    setNewImageUrl('');
    setFormData({
      name: '',
      logo: '',
      isOpen247: false,
      location: {
        address: '',
        latitude: '',
        longitude: '',
      },
      workingHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '18:00', closed: true },
        sunday: { open: '09:00', close: '18:00', closed: true },
      },
      images: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      // Prepare data for submission
      const submitData = {
        name: formData.name,
        logo: formData.logo || undefined,
        isOpen247: formData.isOpen247,
        location: {
          address: formData.location.address,
          ...(formData.location.latitude && { latitude: parseFloat(formData.location.latitude) }),
          ...(formData.location.longitude && { longitude: parseFloat(formData.location.longitude) }),
        },
        workingHours: formData.workingHours,
        images: formData.images.filter(img => img.url.trim() !== '').map((img, index) => ({
          url: img.url,
          isMain: img.isMain,
          index: index,
        })),
      };

      if (editingCompany) {
        await updateCompany(editingCompany.id, submitData);
      } else {
        await createCompany(submitData);
      }
      handleCloseDialog();
      // If adding new company, go to first page. If editing, refresh current page
      if (!editingCompany) {
        setCurrentPage(1);
      } else {
        // Refresh current page after editing
        await fetchCompanies();
      }
    } catch (err) {
      setError(err.message || 'Failed to save company');
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      const hasMain = formData.images.some(img => img.isMain);
      setFormData({
        ...formData,
        images: [
          ...formData.images,
          {
            url: newImageUrl.trim(),
            isMain: !hasMain, // First image becomes main if none exists
            index: formData.images.length,
          },
        ],
      });
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    // If we removed the main image, make the first one main
    if (formData.images[index].isMain && newImages.length > 0) {
      newImages[0].isMain = true;
    }
    setFormData({
      ...formData,
      images: newImages.map((img, i) => ({ ...img, index: i })),
    });
  };

  const handleSetMainImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.map((img, i) => ({
        ...img,
        isMain: i === index,
      })),
    });
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: {
          ...formData.workingHours[day],
          [field]: field === 'closed' ? value : value,
        },
      },
    });
  };

  const handleDelete = async () => {
    try {
      setError('');
      const wasLastItemOnPage = companies.length === 1;
      const wasNotFirstPage = currentPage > 1;
      await deleteCompany(deleteId);
      setOpenDeleteDialog(false);
      setDeleteId(null);
      
      // If current page becomes empty after deletion, go to previous page
      if (wasLastItemOnPage && wasNotFirstPage) {
        setCurrentPage(currentPage - 1);
      } else {
        // Refresh current page after editing
        await fetchCompanies();
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
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + companies.length;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Card className="animate-pulse">
      <CardBody>
        <div className="mb-4 h-48 bg-gray-200 rounded-lg"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="flex gap-2 pt-4">
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
        </div>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex flex-col max-h-screen overflow-hidden">
        <div className="flex-shrink-0 space-y-3 pb-3 backdrop-blur-md bg-white/70 -mx-6 -mt-6 px-6 pt-4 mb-4 border-b border-gray-200/50">
          <div className="flex justify-between items-center">
            <Typography variant="h5" color="blue-gray" className="font-semibold">
              Company
            </Typography>
            <div className="h-8 w-28 bg-gray-200/50 rounded animate-pulse"></div>
          </div>
          
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading company...</p>
              <p className="mt-2 text-sm text-gray-500">Please wait while we fetch the data</p>
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
      <div className="flex-shrink-0 space-y-3 pb-2  backdrop-blur-md bg-white/70  -mt-[10px] px-6 pt-4  border-b border-gray-200/50">
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h5" color="blue-gray" className="font-semibold">
              Company
            </Typography>
            {companies.length > 0 && (
              <Typography variant="small" color="gray" className="mt-0.5 text-xs">
                {companies.length} {companies.length === 1 ? 'company' : 'company'} found
              </Typography>
            )}
          </div>
          <Button onClick={() => handleOpenDialog()} color="blue" size="sm">
            + Add Company
          </Button>
        </div>

        {processing && !loading && (
          <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 text-blue-700 px-3 py-2 rounded flex items-center gap-2 text-sm">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700"></div>
            <span>Processing company data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-3 py-2 rounded text-sm">
            <div className="font-semibold mb-1 text-xs">Error loading company</div>
            <div className="text-xs">{error}</div>
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
             {companies.map((company) => (
               <CompanyCard
                 key={company.id}
                 company={company}
                 onOpenDetails={handleOpenDetails}
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
           {totalItems > 0 && (
             <div className="text-center mt-4 pb-4">
               <Typography variant="small" color="gray">
                 Showing {startIndex + 1} to {endIndex} of {totalItems} company
               </Typography>
             </div>
           )}
        </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="xl">
        <DialogHeader>
          {editingCompany ? 'Edit Company' : 'Create New Company'}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="max-h-[70vh] overflow-y-auto space-y-6">
            {/* Basic Information */}
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-4">
                Basic Information
              </Typography>
              <div className="space-y-4">
                <Input
                  label="Company Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Logo URL"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo && (
                  <div className="flex justify-center">
                    <img 
                      src={formData.logo} 
                      alt="Logo preview" 
                      className="h-32 object-contain rounded-lg border border-gray-300"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isOpen247}
                    onChange={(e) => setFormData({ ...formData, isOpen247: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <Typography variant="small" color="gray">
                    Open 24/7
                  </Typography>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-4">
                Location
              </Typography>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.location.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, address: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter company address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    step="any"
                    label="Latitude"
                    value={formData.location.latitude}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, latitude: e.target.value }
                    })}
                    placeholder="41.3111"
                  />
                  <Input
                    type="number"
                    step="any"
                    label="Longitude"
                    value={formData.location.longitude}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, longitude: e.target.value }
                    })}
                    placeholder="69.2797"
                  />
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-4">
                Working Hours
              </Typography>
              <div className="space-y-3">
                {Object.entries(formData.workingHours).map(([day, hours]) => (
                  <div key={day} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Typography variant="small" className="font-semibold capitalize">
                        {day}
                      </Typography>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hours.closed}
                          onChange={(e) => handleWorkingHoursChange(day, 'closed', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <Typography variant="small" color="gray">
                          Closed
                        </Typography>
                      </div>
                    </div>
                    {!hours.closed && (
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="time"
                          label="Open Time"
                          value={hours.open}
                          onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                        />
                        <Input
                          type="time"
                          label="Close Time"
                          value={hours.close}
                          onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-4">
                Images ({formData.images.length})
              </Typography>
              
              {/* Add New Image */}
              <div className="mb-4 flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    label="Image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  color="blue"
                  onClick={handleAddImage}
                  disabled={!newImageUrl.trim()}
                  className="h-10">
                  Add Image
                </Button>
              </div>

              {/* Images List */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative">
                        <img
                          src={image.url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Error%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        {image.isMain && (
                          <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-semibold">
                            Main
                          </span>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          color="red"
                          variant="filled"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}>
                          ✕
                        </Button>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {!image.isMain && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outlined"
                            color="blue"
                            className="flex-1 text-xs"
                            onClick={() => handleSetMainImage(index)}>
                            Set Main
                          </Button>
                        )}
                        {image.isMain && (
                          <Typography variant="small" color="blue" className="flex-1 text-center py-1">
                            Main Image
                          </Typography>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length === 0 && (
                <Typography variant="small" color="gray" className="text-center py-4">
                  No images added. Add image URLs above.
                </Typography>
              )}
            </div>
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
                    src={selectedCompany.logo} 
                    alt={selectedCompany.name || 'Company logo'} 
                    className="w-full max-w-md h-64 object-cover rounded-lg"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-full max-w-md h-64 bg-gray-100 rounded-lg flex items-center justify-center">
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
                      <div key={category.id} className="p-3 bg-gray-50 rounded-lg">
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
                          src={image.url} 
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

