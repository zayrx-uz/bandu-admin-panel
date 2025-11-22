import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter, Checkbox, IconButton, Textarea, Select, Option } from '@material-tailwind/react';
import { getResources, getResourceById, createResource, updateResource, deleteResource, addResourceImages, updateResourceImage, uploadImageToFileUpload } from '../../services/api';
import { getResourceCategories } from '../../services/api';
import { getCompanies } from '../../services/api';
import { API_BASE_URL } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

// Helper function to normalize image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl.replace(/https?:\/\/admin\.bandu\.uz/g, 'https://api.bandu.uz');
  }
  
  const cleanPath = imageUrl.startsWith('/api') ? imageUrl.substring(5) : imageUrl;
  return `${API_BASE_URL}/${cleanPath}`;
};

export default function Resource() {
  const { settings } = useSettings();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = settings.itemsPerPage;
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    price: '',
    resourceCategoryId: '',
    metadata: {},
    isBookable: true,
    isTimeSlotBased: false,
    timeSlotDurationMinutes: 60,
  });

  useEffect(() => {
    fetchResources();
    fetchCategories();
    fetchCompanies();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getResourceCategories();
      const categoriesList = response?.data?.data || response?.data || response || [];
      setAvailableCategories(Array.isArray(categoriesList) ? categoriesList : []);
    } catch (err) {
      console.error('Error fetching resource categories:', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await getCompanies();
      const companiesList = response?.data?.data || response?.data || response || [];
      setAvailableCompanies(Array.isArray(companiesList) ? companiesList : []);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      setProcessing(true);
      setError('');
      
      console.log('Fetching resources...');
      const response = await getResources();
      console.log('Response received:', response);
      
      let resourcesList = [];
      
      if (Array.isArray(response)) {
        resourcesList = response;
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          resourcesList = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          resourcesList = response.data.data;
        } else if (response.data.resources && Array.isArray(response.data.resources)) {
          resourcesList = response.data.resources;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          resourcesList = response.data.items;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          resourcesList = response.data.results;
        }
      } else if (response.resources && Array.isArray(response.resources)) {
        resourcesList = response.resources;
      } else if (response.items && Array.isArray(response.items)) {
        resourcesList = response.items;
      } else if (response.results && Array.isArray(response.results)) {
        resourcesList = response.results;
      }
      
      console.log('Processed resources:', resourcesList.length, 'resources');
      
      if (resourcesList.length > 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setResources(resourcesList);
      
      if (resourcesList.length === 0) {
        console.warn('No resources found in response. Full response:', response);
        setError('No resources found. The response structure might be different than expected.');
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err.message || 'Failed to load resources. Please check the console for details.');
      setResources([]);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const handleOpenDetails = (resource) => {
    setSelectedResource(resource);
    setOpenDetailsDialog(true);
  };

  const handleOpenDialog = (resource = null) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        name: resource.name || '',
        companyId: resource.companyId?.toString() || resource.company?.id?.toString() || '',
        price: resource.price?.toString() || '',
        resourceCategoryId: resource.resourceCategoryId?.toString() || resource.resourceCategory?.id?.toString() || '',
        metadata: resource.metadata || {},
        isBookable: resource.isBookable !== undefined ? resource.isBookable : true,
        isTimeSlotBased: resource.isTimeSlotBased !== undefined ? resource.isTimeSlotBased : false,
        timeSlotDurationMinutes: resource.timeSlotDurationMinutes || 60,
      });
      setExistingImages(resource.images || []);
    } else {
      setEditingResource(null);
      setFormData({
        name: '',
        companyId: '',
        price: '',
        resourceCategoryId: '',
        metadata: {},
        isBookable: true,
        isTimeSlotBased: false,
        timeSlotDurationMinutes: 60,
      });
      setExistingImages([]);
    }
    setImageFiles([]);
    setImagePreviews([]);
    setImagesToDelete([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingResource(null);
    setFormData({
      name: '',
      companyId: '',
      price: '',
      resourceCategoryId: '',
      metadata: {},
      isBookable: true,
      isTimeSlotBased: false,
      timeSlotDurationMinutes: 60,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
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
      
      const resourceData = {
        name: formData.name,
        companyId: parseInt(formData.companyId),
        price: formData.price ? parseFloat(formData.price) : 0,
        resourceCategoryId: formData.resourceCategoryId ? parseInt(formData.resourceCategoryId) : null,
        isBookable: formData.isBookable || false,
        isTimeSlotBased: formData.isTimeSlotBased || false,
        timeSlotDurationMinutes: formData.timeSlotDurationMinutes ? parseInt(formData.timeSlotDurationMinutes) : 60,
      };

      if (Object.keys(formData.metadata).length > 0) {
        resourceData.metadata = formData.metadata;
      }

      let resourceId;
      
      if (editingResource) {
        // Update resource - First upload new images
        const uploadedImages = [];
        
        if (imageFiles.length > 0) {
          for (let i = 0; i < imageFiles.length; i++) {
            try {
              const imageUrl = await uploadImageToFileUpload(imageFiles[i]);
              
              if (imageUrl) {
                const existingImageCount = existingImages.length - imagesToDelete.length;
                uploadedImages.push({
                  url: imageUrl,
                  index: existingImageCount + i + 1,
                  isMain: false,
                });
              }
            } catch (err) {
              console.error(`Failed to upload image ${i}:`, err);
              throw new Error(`Failed to upload image ${i + 1}: ${err.message}`);
            }
          }
        }

        // Combine existing images (not deleted) with new uploaded images
        const allImages = [];
        
        existingImages.forEach(img => {
          if (!imagesToDelete.includes(img.id)) {
            allImages.push({
              url: img.url,
              index: img.index,
              isMain: img.isMain,
            });
          }
        });
        
        allImages.push(...uploadedImages);

        if (allImages.length > 0) {
          resourceData.images = allImages;
        }

        await updateResource(editingResource.id, resourceData);
        resourceId = editingResource.id;
      } else {
        // Create resource - First upload images
        const uploadedImages = [];
        
        if (imageFiles.length > 0) {
          for (let i = 0; i < imageFiles.length; i++) {
            try {
              const imageUrl = await uploadImageToFileUpload(imageFiles[i]);
              
              if (imageUrl) {
                uploadedImages.push({
                  url: imageUrl,
                  index: i + 1,
                  isMain: i === 0,
                });
              }
            } catch (err) {
              console.error(`Failed to upload image ${i}:`, err);
              throw new Error(`Failed to upload image ${i + 1}: ${err.message}`);
            }
          }
        }

        if (uploadedImages.length > 0) {
          resourceData.images = uploadedImages;
        }

        const result = await createResource(resourceData);
        resourceId = result?.data?.id || result?.data?.data?.id || result?.id;
      }
      
      handleCloseDialog();
      fetchResources();
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Failed to save resource');
    }
  };

  const handleDelete = async () => {
    try {
      setError('');
      await deleteResource(deleteId);
      const wasLastItemOnPage = paginatedResources.length === 1;
      const wasNotFirstPage = currentPage > 1;
      setOpenDeleteDialog(false);
      setDeleteId(null);
      await fetchResources();
      if (wasLastItemOnPage && wasNotFirstPage) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete resource');
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

  // Pagination calculations
  const totalPages = Math.ceil(resources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResources = resources.slice(startIndex, endIndex);

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
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading resources...</p>
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
                Resources
              </Typography>
              {resources.length > 0 && (
                <Typography variant="small" color="gray" className="mt-1">
                  {resources.length} {resources.length === 1 ? 'resource' : 'resources'} found
                </Typography>
              )}
            </div>
            <Button onClick={() => handleOpenDialog()} color="blue" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Resource
            </Button>
          </div>

          {processing && !loading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-400"></div>
              <span>Processing resource data...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              <div className="font-semibold mb-1">Error loading resources</div>
              <div className="text-sm">{error}</div>
              <Button 
                size="sm" 
                color="red" 
                variant="outlined" 
                className="mt-2"
                onClick={fetchResources}>
                Retry
              </Button>
            </div>
          )}
        </div>

        {/* Table Section */}
        {resources.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Typography variant="h6" color="gray" className="mb-2">
                No resources found
              </Typography>
              <Typography variant="small" color="gray" className="mb-4">
                Get started by creating your first resource
              </Typography>
              <Button onClick={() => handleOpenDialog()} color="blue">
                Add Resource
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Company</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResources.map((resource) => (
                    <React.Fragment key={resource.id}>
                      <tr className="border-b border-stone-200 hover:bg-stone-50 transition">
                        <td className="px-6 py-4">
                          <IconButton
                            variant="text"
                            onClick={() => toggleRowExpand(resource.id)}
                            size="sm"
                            className="text-stone-500 hover:text-stone-700">
                            {expandedRows[resource.id] ? (
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
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            {resource.name || 'Unnamed Resource'}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="small" color="gray">
                            {resource.company?.name || `Company ID: ${resource.companyId}` || 'N/A'}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            {resource.price ? `${resource.price.toLocaleString()} UZS` : 'N/A'}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="small" color="gray">
                            {resource.resourceCategory?.name || `Category ID: ${resource.resourceCategoryId}` || 'N/A'}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <IconButton
                              variant="text"
                              color="blue"
                              onClick={() => handleOpenDetails(resource)}
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
                              onClick={() => handleOpenDialog(resource)}
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
                              onClick={() => handleDeleteClick(resource.id)}
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
                      {expandedRows[resource.id] && (
                        <tr className="bg-stone-50 border-b border-stone-200">
                          <td colSpan="6" className="px-6 py-4">
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
                                        {resource.id}
                                      </Typography>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Name:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {resource.name || 'N/A'}
                                      </Typography>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Price:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {resource.price ? `${resource.price.toLocaleString()} UZS` : 'N/A'}
                                      </Typography>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Bookable:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {resource.isBookable ? 'Yes' : 'No'}
                                      </Typography>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Time Slot Based:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {resource.isTimeSlotBased ? 'Yes' : 'No'}
                                      </Typography>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>

                              {/* Right Column - Additional Details */}
                              <Card className="shadow-sm">
                                <CardBody className="p-4">
                                  <Typography variant="h6" color="blue-gray" className="mb-4 font-semibold">
                                    Additional Details
                                  </Typography>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Company:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {resource.company?.name || `ID: ${resource.companyId}` || 'N/A'}
                                      </Typography>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Category:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {resource.resourceCategory?.name || `ID: ${resource.resourceCategoryId}` || 'N/A'}
                                      </Typography>
                                    </div>
                                    {resource.timeSlotDurationMinutes && (
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Time Slot Duration:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                          {resource.timeSlotDurationMinutes} minutes
                                        </Typography>
                                      </div>
                                    )}
                                    {resource.metadata && Object.keys(resource.metadata).length > 0 && (
                                      <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                                        <Typography variant="small" color="gray" className="font-medium">
                                          Metadata:
                                        </Typography>
                                        <Typography variant="small" color="blue-gray" className="font-semibold max-w-xs text-right">
                                          {JSON.stringify(resource.metadata)}
                                        </Typography>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                      <Typography variant="small" color="gray" className="font-medium">
                                        Images:
                                      </Typography>
                                      <Typography variant="small" color="blue-gray" className="font-semibold">
                                        {resource.images?.length || 0}
                                      </Typography>
                                    </div>
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
            {resources.length > 0 && (
              <div className="text-center mt-4 pb-4">
                <Typography variant="small" color="gray">
                  Showing {startIndex + 1} to {Math.min(endIndex, resources.length)} of {resources.length} resources
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
            {editingResource ? 'Edit Resource' : 'Create New Resource'}
          </Typography>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody divider className="space-y-6 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-950 border-b border-gray-200 pb-2">Basic Information</h3>
              <Input
                label="Resource Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Company"
                  value={formData.companyId}
                  onChange={(val) => setFormData({ ...formData, companyId: val })}
                  required>
                  {availableCompanies.map((company) => (
                    <Option key={company.id} value={company.id.toString()}>
                      {company.name}
                    </Option>
                  ))}
                </Select>
                <Select
                  label="Resource Category"
                  value={formData.resourceCategoryId}
                  onChange={(val) => setFormData({ ...formData, resourceCategoryId: val })}>
                  <Option value="">None</Option>
                  {availableCategories.map((category) => (
                    <Option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </div>
              <Input
                type="number"
                label="Price (UZS)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>

            {/* Booking Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-950 border-b border-gray-200 pb-2">Booking Settings</h3>
              <Checkbox
                id="isBookable"
                label="Is Bookable"
                checked={formData.isBookable}
                onChange={(e) => setFormData({ ...formData, isBookable: e.target.checked })}
              />
              <Checkbox
                id="isTimeSlotBased"
                label="Is Time Slot Based"
                checked={formData.isTimeSlotBased}
                onChange={(e) => setFormData({ ...formData, isTimeSlotBased: e.target.checked })}
              />
              {formData.isTimeSlotBased && (
                <Input
                  type="number"
                  label="Time Slot Duration (minutes)"
                  value={formData.timeSlotDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, timeSlotDurationMinutes: e.target.value })}
                  min="1"
                />
              )}
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
                          src={getImageUrl(image.url)} 
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
              {editingResource ? 'Update Resource' : 'Create Resource'}
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
            Delete Resource
          </Typography>
        </DialogHeader>
        <DialogBody divider>
          <Typography>
            Are you sure you want to delete this resource? This action cannot be undone.
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
            Delete Resource
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Resource Details Dialog */}
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
            Resource Details
          </Typography>
        </DialogHeader>
        <DialogBody divider className="max-h-[70vh] overflow-y-auto">
          {selectedResource ? (
            <div className="space-y-6">
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
                      {selectedResource.id}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Name:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedResource.name || 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Price:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedResource.price ? `${selectedResource.price.toLocaleString()} UZS` : 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Bookable:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedResource.isBookable ? 'Yes' : 'No'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Time Slot Based:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedResource.isTimeSlotBased ? 'Yes' : 'No'}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-3">
                  Additional Details
                </Typography>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Company:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedResource.company?.name || `ID: ${selectedResource.companyId}` || 'N/A'}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="gray" className="font-semibold">
                      Category:
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      {selectedResource.resourceCategory?.name || `ID: ${selectedResource.resourceCategoryId}` || 'N/A'}
                    </Typography>
                  </div>
                  {selectedResource.timeSlotDurationMinutes && (
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        Time Slot Duration:
                      </Typography>
                      <Typography variant="small" color="blue-gray">
                        {selectedResource.timeSlotDurationMinutes} minutes
                      </Typography>
                    </div>
                  )}
                  {selectedResource.metadata && Object.keys(selectedResource.metadata).length > 0 && (
                    <div className="flex justify-between">
                      <Typography variant="small" color="gray" className="font-semibold">
                        Metadata:
                      </Typography>
                      <Typography variant="small" color="blue-gray" className="text-right max-w-xs">
                        {JSON.stringify(selectedResource.metadata, null, 2)}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              {selectedResource.images && selectedResource.images.length > 0 && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Images ({selectedResource.images.length})
                  </Typography>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedResource.images.map((image) => (
                      <div key={image.id} className="relative">
                        <img 
                          src={getImageUrl(image.url)} 
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
                No resource selected
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

