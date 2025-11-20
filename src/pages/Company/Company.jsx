import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter, Checkbox } from '@material-tailwind/react';
import { getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany, createCompanyWithFiles, updateCompanyWithFiles, addCompanyImage, updateCompanyImage, deleteCompanyImage } from '../../services/api';
import { getCompanyCategories } from '../../services/api';
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
  const cleanPath = logo.startsWith('/api') ? logo.substring(5) : logo;
  return `${API_BASE_URL}/${cleanPath}`;
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
  const [expandedRows, setExpandedRows] = useState({});
  const [logoErrors, setLogoErrors] = useState({});
  const [availableCategories, setAvailableCategories] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    isOpen247: false,
    location: {
      address: '',
      latitude: '',
      longitude: '',
    },
    workingHours: {
      monday: { open: '', close: '', closed: false },
      tuesday: { open: '', close: '', closed: false },
      wednesday: { open: '', close: '', closed: false },
      thursday: { open: '', close: '', closed: false },
      friday: { open: '', close: '', closed: false },
      saturday: { open: '', close: '', closed: false },
      sunday: { open: '', close: '', closed: false },
    },
    categoryIds: [],
  });

  useEffect(() => {
    fetchCompanies();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCompanyCategories();
      const categoriesList = response?.data?.data || response?.data || response || [];
      setAvailableCategories(Array.isArray(categoriesList) ? categoriesList : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

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
        isOpen247: company.isOpen247 || false,
        location: {
          address: company.location?.address || '',
          latitude: company.location?.latitude?.toString() || '',
          longitude: company.location?.longitude?.toString() || '',
        },
        workingHours: company.workingHours || {
          monday: { open: '', close: '', closed: false },
          tuesday: { open: '', close: '', closed: false },
          wednesday: { open: '', close: '', closed: false },
          thursday: { open: '', close: '', closed: false },
          friday: { open: '', close: '', closed: false },
          saturday: { open: '', close: '', closed: false },
          sunday: { open: '', close: '', closed: false },
        },
        categoryIds: company.categories?.map(cat => cat.id) || [],
      });
      // Set existing images
      setExistingImages(company.images || []);
      setLogoPreview(company.logo ? getLogoUrl(company.logo) : null);
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        description: '',
        email: '',
        phone: '',
        isOpen247: false,
        location: {
          address: '',
          latitude: '',
          longitude: '',
        },
        workingHours: {
          monday: { open: '', close: '', closed: false },
          tuesday: { open: '', close: '', closed: false },
          wednesday: { open: '', close: '', closed: false },
          thursday: { open: '', close: '', closed: false },
          friday: { open: '', close: '', closed: false },
          saturday: { open: '', close: '', closed: false },
          sunday: { open: '', close: '', closed: false },
        },
        categoryIds: [],
      });
      setExistingImages([]);
      setLogoPreview(null);
    }
    // Reset file states
    setLogoFile(null);
    setImageFiles([]);
    setImagePreviews([]);
    setImagesToDelete([]);
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
      isOpen247: false,
      location: {
        address: '',
        latitude: '',
        longitude: '',
      },
      workingHours: {
        monday: { open: '', close: '', closed: false },
        tuesday: { open: '', close: '', closed: false },
        wednesday: { open: '', close: '', closed: false },
        thursday: { open: '', close: '', closed: false },
        friday: { open: '', close: '', closed: false },
        saturday: { open: '', close: '', closed: false },
        sunday: { open: '', close: '', closed: false },
      },
      categoryIds: [],
    });
    setLogoFile(null);
    setLogoPreview(null);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImagePreview = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const setMainImage = (imageId) => {
    setExistingImages(prev => prev.map(img => ({
      ...img,
      isMain: img.id === imageId
    })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      // Prepare company data matching API structure
      const companyData = {
        name: formData.name,
        isOpen247: formData.isOpen247,
        location: {
          address: formData.location.address || '',
          ...(formData.location.latitude && { latitude: parseFloat(formData.location.latitude) }),
          ...(formData.location.longitude && { longitude: parseFloat(formData.location.longitude) }),
        },
        workingHours: formData.workingHours,
        ...(formData.categoryIds.length > 0 && { categoryIds: formData.categoryIds }),
        // Optional fields - only include if they have values
        ...(formData.description && { description: formData.description }),
        ...(formData.email && { email: formData.email }),
        ...(formData.phone && { phone: formData.phone }),
      };

      let companyId;
      
      // Create or update company
      if (editingCompany) {
        // Update company
        if (logoFile) {
          // If logo is being updated, use FormData
          const formDataToSend = new FormData();
          formDataToSend.append('name', companyData.name);
          formDataToSend.append('isOpen247', companyData.isOpen247);
          formDataToSend.append('logo', logoFile);
          
          // Add location as JSON string
          formDataToSend.append('location', JSON.stringify(companyData.location));
          
          // Add workingHours as JSON string
          formDataToSend.append('workingHours', JSON.stringify(companyData.workingHours));
          
          // Add categoryIds as JSON array
          if (companyData.categoryIds && companyData.categoryIds.length > 0) {
            formDataToSend.append('categoryIds', JSON.stringify(companyData.categoryIds));
          }
          
          // Add optional fields
          if (companyData.description) formDataToSend.append('description', companyData.description);
          if (companyData.email) formDataToSend.append('email', companyData.email);
          if (companyData.phone) formDataToSend.append('phone', companyData.phone);
          
          await updateCompanyWithFiles(editingCompany.id, formDataToSend);
        } else {
          await updateCompany(editingCompany.id, companyData);
        }
        companyId = editingCompany.id;
      } else {
        // Create company
        if (logoFile) {
          const formDataToSend = new FormData();
          formDataToSend.append('name', companyData.name);
          formDataToSend.append('isOpen247', companyData.isOpen247);
          formDataToSend.append('logo', logoFile);
          
          // Add location as JSON string
          formDataToSend.append('location', JSON.stringify(companyData.location));
          
          // Add workingHours as JSON string
          formDataToSend.append('workingHours', JSON.stringify(companyData.workingHours));
          
          // Add categoryIds as JSON array
          if (companyData.categoryIds && companyData.categoryIds.length > 0) {
            formDataToSend.append('categoryIds', JSON.stringify(companyData.categoryIds));
          }
          
          // Add optional fields
          if (companyData.description) formDataToSend.append('description', companyData.description);
          if (companyData.email) formDataToSend.append('email', companyData.email);
          if (companyData.phone) formDataToSend.append('phone', companyData.phone);
          
          const result = await createCompanyWithFiles(formDataToSend);
          // Handle different response structures
          companyId = result?.data?.id || result?.data?.data?.id || result?.id;
        } else {
          const result = await createCompany(companyData);
          // Handle different response structures
          companyId = result?.data?.id || result?.data?.data?.id || result?.id;
        }
      }

      // Handle images separately using the image API endpoints
      if (companyId) {
        // Delete images that were marked for deletion
        for (const imageId of imagesToDelete) {
          try {
            await deleteCompanyImage(companyId, imageId);
          } catch (err) {
            console.error(`Failed to delete image ${imageId}:`, err);
          }
        }

        // Add new images
        for (let i = 0; i < imageFiles.length; i++) {
          try {
            const isMain = i === 0 && existingImages.length === 0 && imagesToDelete.length === existingImages.length;
            await addCompanyImage(companyId, imageFiles[i]);
          } catch (err) {
            console.error(`Failed to add image ${i}:`, err);
          }
        }

        // Update main image if changed
        // Check if main image was changed from original
        if (editingCompany) {
          const originalMainImage = editingCompany.images?.find(img => img.isMain);
          const newMainImage = existingImages.find(img => img.isMain);
          
          // If main image changed or if there's a new main image
          if (newMainImage && (!originalMainImage || originalMainImage.id !== newMainImage.id)) {
            try {
              await updateCompanyImage(companyId, newMainImage.id, null, true);
            } catch (err) {
              console.error('Failed to update main image:', err);
            }
          }
        } else {
          // For new companies, set first image as main if no main image exists
          if (imageFiles.length > 0 && existingImages.length === 0) {
            // The first image added will be set as main by default
            // We'll need to update it after adding
            try {
              // Get the company again to get the image IDs
              const updatedCompany = await getCompanyById(companyId);
              const companyImages = updatedCompany?.data?.images || updatedCompany?.data?.data?.images || updatedCompany?.images || [];
              if (companyImages.length > 0) {
                await updateCompanyImage(companyId, companyImages[0].id, null, true);
              }
            } catch (err) {
              console.error('Failed to set main image:', err);
            }
          }
        }
      }
      
      handleCloseDialog();
      fetchCompanies();
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Failed to save company');
    }
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
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

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogoError = (companyId) => {
    setLogoErrors((prev) => ({ ...prev, [companyId]: true }));
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-8xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading companies...</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-8xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
            <div>
              <Typography variant="h3" color="blue-gray" className="text-2xl font-bold">
                Companies
              </Typography>
              {companies.length > 0 && (
                <Typography variant="small" color="gray" className="mt-1">
                  {companies.length} {companies.length === 1 ? 'company' : 'companies'} found
                </Typography>
              )}
            </div>
            <Button onClick={() => handleOpenDialog()} color="blue" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Company
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
              <div className="font-semibold mb-1">Error loading companies</div>
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

        {/* Table Section */}
        {companies.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Typography variant="h6" color="gray" className="mb-2">
                No companies found
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
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
              <table className="w-full">
                <thead className="bg-transparent border-b border-stone-200 bg-gradient-to-br from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700"></th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Logo</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCompanies.map((company) => (
                    <React.Fragment key={company.id}>
                      <tr className="border-b border-stone-200 hover:bg-stone-50 transition">
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => toggleRowExpand(company.id)} 
                            className="text-stone-500 hover:text-stone-700"
                          >
                            {expandedRows[company.id] ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                              </svg>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {company.logo && !logoErrors[company.id] ? (
                            <img 
                              src={getLogoUrl(company.logo)} 
                              alt={company.name || 'Company logo'} 
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={() => handleLogoError(company.id)}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Typography variant="small" color="gray" className="text-xs">
                                No logo
                              </Typography>
                            </div>
                          )}
                        </td>
                          <td className="px-6 py-4">
                            <Typography variant="small" color="blue-gray" className="font-medium">
                              {company.name || 'Unnamed Company'}
                            </Typography>
                          </td>
                          <td className="px-6 py-4">
                            {company.location?.address ? (
                              <div className="flex items-start gap-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">📍</span>
                                <Typography variant="small" color="gray" className="max-w-xs">
                                  {company.location.address}
                                </Typography>
                              </div>
                            ) : (
                              <Typography variant="small" color="gray">
                                N/A
                              </Typography>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenDetails(company)}
                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition"
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleOpenDialog(company)}
                                className="text-stone-600 hover:text-stone-900 p-1 hover:bg-stone-100 rounded transition"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(company.id)}
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRows[company.id] && (
                          <tr className="bg-stone-50 border-b border-stone-200">
                            <td colSpan="5" className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column - Basic Information */}
                                <div>
                                  <h4 className="font-semibold text-stone-900 mb-4">Basic Information</h4>
                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-stone-200 pb-2">
                                      <span className="text-stone-600">ID:</span>
                                      <span className="font-medium text-stone-900">{company.id}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-stone-200 pb-2">
                                      <span className="text-stone-600">Name:</span>
                                      <span className="font-medium text-stone-900">{company.name || 'N/A'}</span>
                                    </div>
                                    {company.description && (
                                      <div className="flex justify-between border-b border-stone-200 pb-2">
                                        <span className="text-stone-600">Description:</span>
                                        <span className="font-medium text-stone-900 max-w-xs text-right">{company.description}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between border-b border-stone-200 pb-2">
                                      <span className="text-stone-600">Open 24/7:</span>
                                      <span className="font-medium text-stone-900">{company.isOpen247 ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-stone-200 pb-2">
                                      <span className="text-stone-600">Categories:</span>
                                      <span className="font-medium text-stone-900">{company.categories?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-stone-200 pb-2">
                                      <span className="text-stone-600">Resources:</span>
                                      <span className="font-medium text-stone-900">{company.resources?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-stone-200 pb-2">
                                      <span className="text-stone-600">Resource Categories:</span>
                                      <span className="font-medium text-stone-900">{company.resourceCategories?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-stone-600">Images:</span>
                                      <span className="font-medium text-stone-900">{company.images?.length || 0}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column - Location & Additional Details */}
                                <div>
                                  <h4 className="font-semibold text-stone-900 mb-4">Location & Details</h4>
                                  <div className="space-y-3 text-sm">
                                    {company.location && (
                                      <>
                                        {company.location.address && (
                                          <div className="flex justify-between border-b border-stone-200 pb-2">
                                            <span className="text-stone-600">Address:</span>
                                            <span className="font-medium text-stone-900 max-w-xs text-right">{company.location.address}</span>
                                          </div>
                                        )}
                                        {company.location.latitude && (
                                          <div className="flex justify-between border-b border-stone-200 pb-2">
                                            <span className="text-stone-600">Latitude:</span>
                                            <span className="font-medium text-stone-900">{company.location.latitude}</span>
                                          </div>
                                        )}
                                        {company.location.longitude && (
                                          <div className="flex justify-between border-b border-stone-200 pb-2">
                                            <span className="text-stone-600">Longitude:</span>
                                            <span className="font-medium text-stone-900">{company.location.longitude}</span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                    {company.email && (
                                      <div className="flex justify-between border-b border-stone-200 pb-2">
                                        <span className="text-stone-600">Email:</span>
                                        <span className="font-medium text-stone-900">{company.email}</span>
                                      </div>
                                    )}
                                    {company.phone && (
                                      <div className="flex justify-between">
                                        <span className="text-stone-600">Phone:</span>
                                        <span className="font-medium text-stone-900">{company.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Categories Section */}
                              {company.categories && company.categories.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-stone-200">
                                  <h4 className="font-semibold text-stone-900 mb-4">Categories ({company.categories.length})</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {company.categories.map((category) => (
                                      <div key={category.id} className="p-3 bg-white rounded-lg border border-stone-200">
                                        <div className="flex justify-between">
                                          <span className="text-xs text-stone-600">ID: {category.id}</span>
                                          <span className="font-medium text-stone-900">{category.name}</span>
                                        </div>
                                        {category.description && (
                                          <p className="text-xs text-stone-600 mt-1">{category.description}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Working Hours Section */}
                              {company.workingHours && (
                                <div className="mt-6 pt-6 border-t border-stone-200">
                                  <h4 className="font-semibold text-stone-900 mb-4">Working Hours</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    {Object.entries(company.workingHours).map(([day, hours]) => (
                                      <div key={day} className="flex justify-between border-b border-stone-200 pb-2">
                                        <span className="text-stone-600 capitalize">{day}:</span>
                                        <span className="font-medium text-stone-900">
                                          {hours.closed ? 'Closed' : `${hours.open || 'N/A'} - ${hours.close || 'N/A'}`}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Images Section */}
                              {company.images && company.images.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-stone-200">
                                  <h4 className="font-semibold text-stone-900 mb-4">Images ({company.images.length})</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {company.images.map((image) => (
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
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                </tbody>
              </table>
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
                  Showing {startIndex + 1} to {Math.min(endIndex, companies.length)} of {companies.length} companies
                </Typography>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {editingCompany ? 'Edit Company' : 'Create New Company'}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-950 border-b border-gray-200 pb-2">Basic Information</h3>
              <Input
                label="Company Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-950 focus:border-gray-950 bg-white text-gray-950 resize-none"
                  rows={3}
                  placeholder="Enter company description"
                />
              </div>
              <Input
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                type="tel"
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isOpen247"
                  checked={formData.isOpen247}
                  onChange={(e) => setFormData({ ...formData, isOpen247: e.target.checked })}
                  className="w-4 h-4 text-gray-950 border-gray-300 rounded focus:ring-gray-950"
                />
                <label htmlFor="isOpen247" className="text-sm font-medium text-gray-700">
                  Open 24/7
                </label>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-950 border-b border-gray-200 pb-2">Location</h3>
              <Input
                label="Address"
                value={formData.location.address}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, address: e.target.value }
                })}
              />
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
                  placeholder="e.g., 41.3111"
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
                  placeholder="e.g., 69.2797"
                />
              </div>
            </div>

            {/* Working Hours */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-950 border-b border-gray-200 pb-2">Working Hours</h3>
              <div className="space-y-3">
                {Object.entries(formData.workingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 w-24">
                      <input
                        type="checkbox"
                        checked={hours.closed}
                        onChange={(e) => handleWorkingHoursChange(day, 'closed', e.target.checked)}
                        className="w-4 h-4 text-gray-950 border-gray-300 rounded focus:ring-gray-950"
                      />
                      <label className="text-sm font-medium text-gray-700 capitalize min-w-[60px]">
                        {day}
                      </label>
                    </div>
                    {!hours.closed && (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          label="Open"
                          value={hours.open}
                          onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                          containerProps={{ className: 'min-w-0 flex-1' }}
                        />
                        <span className="text-gray-500 mt-6">-</span>
                        <Input
                          type="time"
                          label="Close"
                          value={hours.close}
                          onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                          containerProps={{ className: 'min-w-0 flex-1' }}
                        />
                      </div>
                    )}
                    {hours.closed && (
                      <span className="text-sm text-gray-500">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-950 border-b border-gray-200 pb-2">Categories</h3>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {availableCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={formData.categoryIds.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="w-4 h-4 text-gray-950 border-gray-300 rounded focus:ring-gray-950"
                    />
                    <label 
                      htmlFor={`category-${category.id}`} 
                      className="text-sm text-gray-700 cursor-pointer flex-1"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
                {availableCategories.length === 0 && (
                  <p className="text-sm text-gray-500 col-span-2">No categories available</p>
                )}
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-950 border-b border-gray-200 pb-2">Logo</h3>
              <div className="space-y-3">
                {(logoPreview || (editingCompany && editingCompany.logo && !logoFile)) && (
                  <div className="relative inline-block">
                    <img 
                      src={logoPreview || getLogoUrl(editingCompany.logo)} 
                      alt="Logo preview" 
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                    {logoFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(editingCompany?.logo ? getLogoUrl(editingCompany.logo) : null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {logoPreview || (editingCompany && editingCompany.logo) ? 'Change Logo' : 'Upload Logo'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-950 file:text-white hover:file:bg-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-950 border-b border-gray-200 pb-2">Images</h3>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Current Images</p>
                  <div className="grid grid-cols-3 gap-3">
                    {existingImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img 
                          src={getLogoUrl(image.url)} 
                          alt={`Image ${image.index}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        {image.isMain && (
                          <span className="absolute top-1 left-1 bg-gray-950 text-white text-xs px-2 py-1 rounded">
                            Main
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          {!image.isMain && (
                            <button
                              type="button"
                              onClick={() => setMainImage(image.id)}
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                              Set Main
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(image.id)}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">New Images</p>
                  <div className="grid grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImagePreview(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-950 file:text-white hover:file:bg-gray-800"
                />
                <p className="mt-1 text-xs text-gray-500">You can select multiple images</p>
              </div>
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

