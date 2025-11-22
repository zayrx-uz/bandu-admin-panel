import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter, Checkbox, IconButton, Textarea } from '@material-tailwind/react';
import { getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany, createCompanyWithFiles, updateCompanyWithFiles, addCompanyImage, updateCompanyImage, deleteCompanyImage, uploadImageToFileUpload } from '../../services/api';
import { getCompanyCategories } from '../../services/api';
import { API_BASE_URL } from '../../services/api';
import MapSelector from '../../components/MapSelector';
import { useSettings } from '../../context/SettingsContext';

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
  const { settings } = useSettings();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = settings.itemsPerPage;
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
  const [mapKey, setMapKey] = useState(0);
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
      monday: { open: '09:00', close: '21:00', closed: false },
      tuesday: { open: '09:00', close: '21:00', closed: false },
      wednesday: { open: '09:00', close: '21:00', closed: false },
      thursday: { open: '09:00', close: '21:00', closed: false },
      friday: { open: '09:00', close: '21:00', closed: false },
      saturday: { open: '', close: '', closed: true },
      sunday: { open: '', close: '', closed: true },
    },
    categoryIds: [],
    resourceCategoryIds: [],
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
    // Force map to re-render when dialog opens
    setMapKey(prev => prev + 1);
    
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
          monday: { open: '09:00', close: '21:00', closed: false },
          tuesday: { open: '09:00', close: '21:00', closed: false },
          wednesday: { open: '09:00', close: '21:00', closed: false },
          thursday: { open: '09:00', close: '21:00', closed: false },
          friday: { open: '09:00', close: '21:00', closed: false },
          saturday: { open: '', close: '', closed: true },
          sunday: { open: '', close: '', closed: true },
        },
        categoryIds: company.categories?.map(cat => cat.id) || [],
        resourceCategoryIds: company.resourceCategories?.map(cat => cat.id) || [],
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
          monday: { open: '09:00', close: '21:00', closed: false },
          tuesday: { open: '09:00', close: '21:00', closed: false },
          wednesday: { open: '09:00', close: '21:00', closed: false },
          thursday: { open: '09:00', close: '21:00', closed: false },
          friday: { open: '09:00', close: '21:00', closed: false },
          saturday: { open: '', close: '', closed: true },
          sunday: { open: '', close: '', closed: true },
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
          monday: { open: '09:00', close: '21:00', closed: false },
          tuesday: { open: '09:00', close: '21:00', closed: false },
          wednesday: { open: '09:00', close: '21:00', closed: false },
          thursday: { open: '09:00', close: '21:00', closed: false },
          friday: { open: '09:00', close: '21:00', closed: false },
          saturday: { open: '', close: '', closed: true },
          sunday: { open: '', close: '', closed: true },
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
      
      // Prepare company data matching API structure (https://app.bandu.uz/api/docs#/Company)
      // According to API docs: name, location, categoryIds, resourceCategoryIds, isOpen247, workingHours, images
      const companyData = {
        name: formData.name,
        isOpen247: formData.isOpen247 || false,
        location: {
          address: formData.location.address || '',
          ...(formData.location.latitude && formData.location.latitude !== '' && !isNaN(parseFloat(formData.location.latitude)) && { 
            latitude: parseFloat(formData.location.latitude) 
          }),
          ...(formData.location.longitude && formData.location.longitude !== '' && !isNaN(parseFloat(formData.location.longitude)) && { 
            longitude: parseFloat(formData.location.longitude) 
          }),
        },
        workingHours: formData.workingHours,
        // Always include categoryIds array (empty array removes all categories per API docs)
        categoryIds: formData.categoryIds || [],
        // Include resourceCategoryIds if available (empty array removes all resource categories)
        resourceCategoryIds: formData.resourceCategoryIds || [],
      };
      
      // Optional fields - only include if they have values
      if (formData.description) {
        companyData.description = formData.description;
      }
      if (formData.email) {
        companyData.email = formData.email;
      }
      if (formData.phone) {
        companyData.phone = formData.phone;
      }

      let companyId;
      
      // Create or update company
      if (editingCompany) {
        // Update company - First upload new images and logo to File Upload API
        const uploadedImages = [];
        let logoUrl = null;
        
        // Upload new images to File Upload API first
        if (imageFiles.length > 0) {
          for (let i = 0; i < imageFiles.length; i++) {
            try {
              const imageUrl = await uploadImageToFileUpload(imageFiles[i]);
              
              if (imageUrl) {
                // Calculate index based on existing images + new images
                const existingImageCount = existingImages.length - imagesToDelete.length;
                uploadedImages.push({
                  url: imageUrl,
                  index: existingImageCount + i + 1,
                  isMain: false, // Will be updated if needed
                });
              }
            } catch (err) {
              console.error(`Failed to upload image ${i}:`, err);
              throw new Error(`Failed to upload image ${i + 1}: ${err.message}`);
            }
          }
        }

        // Upload logo to File Upload API if being updated
        if (logoFile) {
          try {
            logoUrl = await uploadImageToFileUpload(logoFile);
          } catch (err) {
            console.error('Failed to upload logo:', err);
            throw new Error(`Failed to upload logo: ${err.message}`);
          }
        }

        // Combine existing images (not deleted) with new uploaded images
        const allImages = [];
        
        // Add existing images that are not marked for deletion
        existingImages.forEach(img => {
          if (!imagesToDelete.includes(img.id)) {
            allImages.push({
              url: img.url,
              index: img.index,
              isMain: img.isMain,
            });
          }
        });
        
        // Add newly uploaded images
        allImages.push(...uploadedImages);

        // Include images URLs in company data if there are any images
        // According to API docs, images should be an array of { url, index, isMain }
        if (allImages.length > 0) {
          companyData.images = allImages;
        }

        // Note: Logo is not part of the company update endpoint according to API docs
        // Logo should be handled separately if needed via company images with isMain flag
        // If logoUrl exists, we can add it as the main image
        if (logoUrl) {
          // Add logo as the first image with isMain: true
          if (!companyData.images) {
            companyData.images = [];
          }
          // Remove existing main image flag
          companyData.images = companyData.images.map(img => ({ ...img, isMain: false }));
          // Add logo as main image at index 0
          companyData.images.unshift({
            url: logoUrl,
            index: 0,
            isMain: true,
          });
        }

        // Update company with all data including image URLs
        await updateCompany(editingCompany.id, companyData);
        companyId = editingCompany.id;
      } else {
        // Create company - First upload images to File Upload API
        const uploadedImages = [];
        
        // Upload all images to File Upload API first
        if (imageFiles.length > 0) {
          for (let i = 0; i < imageFiles.length; i++) {
            try {
              const imageUrl = await uploadImageToFileUpload(imageFiles[i]);
              
              if (imageUrl) {
                uploadedImages.push({
                  url: imageUrl,
                  index: i + 1,
                  isMain: i === 0, // First image is main
                });
              }
            } catch (err) {
              console.error(`Failed to upload image ${i}:`, err);
              throw new Error(`Failed to upload image ${i + 1}: ${err.message}`);
            }
          }
        }

        // Upload logo to File Upload API if present
        let logoUrl = null;
        if (logoFile) {
          try {
            logoUrl = await uploadImageToFileUpload(logoFile);
          } catch (err) {
            console.error('Failed to upload logo:', err);
            throw new Error(`Failed to upload logo: ${err.message}`);
          }
        }

        // Include images URLs in company data if any were uploaded
        if (uploadedImages.length > 0) {
          companyData.images = uploadedImages;
        }

        // Include logo URL if uploaded
        if (logoUrl) {
          companyData.logo = logoUrl;
        }

        // Create company with all data including image URLs
        const result = await createCompany(companyData);
        // Handle different response structures
        companyId = result?.data?.id || result?.data?.data?.id || result?.id;
      }

      // Main image update is handled in the company update payload above
      // No separate image handling needed since images are included in the update payload
      
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
                          <IconButton
                            variant="text"
                            onClick={() => toggleRowExpand(company.id)}
                            size="sm"
                            className="text-stone-500 hover:text-stone-700">
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
                          </IconButton>
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
                              <IconButton
                                variant="text"
                                color="blue"
                                onClick={() => handleOpenDetails(company)}
                                size="sm"
                                title="View Details">
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
                              </IconButton>
                              <IconButton
                                variant="text"
                                color="gray"
                                onClick={() => handleOpenDialog(company)}
                                size="sm"
                                title="Edit">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </IconButton>
                              <IconButton
                                variant="text"
                                color="red"
                                onClick={() => handleDeleteClick(company.id)}
                                size="sm"
                                title="Delete">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </IconButton>
                            </div>
                          </td>
                        </tr>
                        {expandedRows[company.id] && (
                          <tr className="bg-stone-50 border-b border-stone-200">
                            <td colSpan="5" className="px-6 py-4">
                              <div 
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                style={{
                                  animation: 'slideDown 0.3s ease-out',
                                }}
                              >
                                {/* Left Column - Basic Information */}
                                <Card className="shadow-sm">
                                  <CardBody className="p-4">
                                    <Typography variant="h6" color="blue-gray" className="mb-4 font-semibold">
                                      Basic Information
                                    </Typography>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          ID:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                          {company.id}
                                        </Typography>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Name:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                          {company.name || 'N/A'}
                                        </Typography>
                                      </div>
                                      {company.description && (
                                        <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                                          <Typography variant="small" color="gray" className="font-medium">
                                            Description:
                                          </Typography>
                                          <Typography variant="small" color="blue-gray" className="font-semibold max-w-xs text-right">
                                            {company.description}
                                          </Typography>
                                        </div>
                                      )}
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Open 24/7:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                          {company.isOpen247 ? 'Yes' : 'No'}
                                        </Typography>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Categories:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                          {company.categories?.length || 0}
                                        </Typography>
                                      </div>
                                    </div>
                                  </CardBody>
                                </Card>

                                {/* Right Column - Location & Details */}
                                <Card className="shadow-sm">
                                  <CardBody className="p-4">
                                    <Typography variant="h6" color="blue-gray" className="mb-4 font-semibold">
                                      Location & Details
                                    </Typography>
                                    <div className="space-y-3">
                                      {company.location?.address && (
                                        <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                                          <Typography variant="small" color="gray" className="font-medium">
                                            Address:
                                          </Typography>
                                          <Typography variant="small" color="blue-gray" className="font-semibold max-w-xs text-right">
                                            {company.location.address}
                                          </Typography>
                                        </div>
                                      )}
                                      {company.location?.latitude && (
                                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                          <Typography variant="small" color="gray" className="font-medium">
                                            Latitude:
                                          </Typography>
                                          <Typography variant="small" color="blue-gray" className="font-semibold">
                                            {company.location.latitude}
                                          </Typography>
                                        </div>
                                      )}
                                      {company.location?.longitude && (
                                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                          <Typography variant="small" color="gray" className="font-medium">
                                            Longitude:
                                          </Typography>
                                          <Typography variant="small" color="blue-gray" className="font-semibold">
                                            {company.location.longitude}
                                          </Typography>
                                        </div>
                                      )}
                                      {company.email && (
                                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                          <Typography variant="small" color="gray" className="font-medium">
                                            Email:
                                          </Typography>
                                          <Typography variant="small" color="blue-gray" className="font-semibold">
                                            {company.email}
                                          </Typography>
                                        </div>
                                      )}
                                      {company.phone && (
                                        <div className="flex justify-between items-center">
                                          <Typography variant="small" color="gray" className="font-medium">
                                            Phone:
                                          </Typography>
                                          <Typography variant="small" color="blue-gray" className="font-semibold">
                                            {company.phone}
                                          </Typography>
                                        </div>
                                      )}
                                      {!company.location?.address && !company.location?.latitude && !company.location?.longitude && !company.email && !company.phone && (
                                        <Typography variant="small" color="gray" className="text-center py-4">
                                          No location or contact details available
                                        </Typography>
                                      )}
                                    </div>
                                  </CardBody>
                                </Card>
                              </div>
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
      <Dialog 
        open={openDialog} 
        handler={handleCloseDialog} 
        size="xl"
        className="max-h-[90vh]"
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
      >
        <DialogHeader className="border-b border-gray-200 pb-4">
          <Typography variant="h4" color="blue-gray">
            {editingCompany ? 'Edit Company' : 'Create New Company'}
          </Typography>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody divider className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-950 border-b border-gray-200 pb-2">Basic Information</h3>
              <Input
                label="Company Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Enter company description"
              />
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
              <Checkbox
                id="isOpen247"
                label="Open 24/7"
                checked={formData.isOpen247}
                onChange={(e) => setFormData({ ...formData, isOpen247: e.target.checked })}
              />
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
              
              {/* Map Selector */}
              <div key={mapKey}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Location on Map
                </label>
                <MapSelector
                  latitude={formData.location.latitude}
                  longitude={formData.location.longitude}
                  onCoordinatesChange={(coords) => {
                    setFormData({ 
                      ...formData, 
                      location: { 
                        ...formData.location, 
                        latitude: coords.latitude,
                        longitude: coords.longitude
                      }
                    });
                  }}
                  height="350px"
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
                        <Checkbox
                          checked={hours.closed}
                          onChange={(e) => handleWorkingHoursChange(day, 'closed', e.target.checked)}
                          label={day.charAt(0).toUpperCase() + day.slice(1)}
                          className="capitalize"
                        />
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
                      <IconButton
                        type="button"
                        variant="filled"
                        color="red"
                        size="sm"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(editingCompany?.logo ? getLogoUrl(editingCompany.logo) : null);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full">
                        ×
                      </IconButton>
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
                            <Button
                              type="button"
                              size="sm"
                              color="blue"
                              onClick={() => setMainImage(image.id)}
                              className="px-2 py-1 text-xs">
                              Set Main
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            color="red"
                            onClick={() => removeExistingImage(image.id)}
                            className="px-2 py-1 text-xs">
                            Delete
                          </Button>
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
                        <IconButton
                          type="button"
                          variant="filled"
                          color="red"
                          size="sm"
                          onClick={() => removeImagePreview(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full">
                          ×
                        </IconButton>
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
          <DialogFooter className="border-t border-gray-200 pt-4">
            <Button
              variant="text"
              color="red"
              onClick={handleCloseDialog}
              className="mr-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              color="blue"
              variant="gradient"
            >
              {editingCompany ? 'Update Company' : 'Create Company'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        handler={() => setOpenDeleteDialog(false)} 
        size="sm"
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
      >
        <DialogHeader className="border-b border-gray-200 pb-4">
          <Typography variant="h5" color="red">
            Delete Company
          </Typography>
        </DialogHeader>
        <DialogBody divider>
          <Typography>
            Are you sure you want to delete this company? This action cannot be undone.
          </Typography>
        </DialogBody>
        <DialogFooter className="border-t border-gray-200 pt-4">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setOpenDeleteDialog(false)}
            className="mr-1">
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="red" 
            onClick={handleDelete}
          >
            Delete Company
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Company Details Dialog */}
      <Dialog 
        open={openDetailsDialog} 
        handler={() => setOpenDetailsDialog(false)} 
        size="lg"
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
      >
        <DialogHeader className="border-b border-gray-200 pb-4">
          <Typography variant="h4" color="blue-gray">
            Company Details
          </Typography>
        </DialogHeader>
        <DialogBody divider className="max-h-[70vh] overflow-y-auto">
          {selectedCompany ? (
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
          ) : (
            <div className="text-center py-8">
              <Typography variant="small" color="gray">
                No company selected
              </Typography>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="border-t border-gray-200 pt-4">
          <Button
            variant="gradient"
            color="blue"
            onClick={() => setOpenDetailsDialog(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

